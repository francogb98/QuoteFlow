"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { TipoConfiguracionTarifa } from "@prisma/client";
import {
  validateTariffConfiguration,
  getApplicableTariffRange,
} from "./lib/tariff-utils";

export async function addUserToAdmin(data: {
  nombre: string;
  apellido: string;
  documento: string;
  edad?: number;
  telefono?: string;
  administradorId: string;
  primerPagoMesSiguiente: boolean;
  fechaInicioMembresia?: Date;
}) {
  try {
    // Verificar si el usuario ya existe
    const existingUser = await prisma.usuario.findFirst({
      where: {
        documento: data.documento,
        administradorId: data.administradorId,
      },
    });

    if (existingUser) {
      throw new Error("Ya existe un usuario con este documento");
    }

    // Verificar que el administrador existe y obtener su configuración de tarifas
    const adminExists = await prisma.administrador.findUnique({
      where: { id: data.administradorId },
      include: {
        configuracionTarifa: {
          include: {
            rangos: true,
          },
        },
      },
    });

    if (!adminExists) {
      throw new Error("Administrador no encontrado");
    }

    // Validar configuración de tarifas
    const validation = validateTariffConfiguration(
      adminExists.configuracionTarifa
    );
    if (!validation.isValid) {
      throw new Error(
        `Configuración de tarifas inválida: ${validation.errors.join(", ")}`
      );
    }

    const configuracionTarifa = adminExists.configuracionTarifa!;

    // Determinar la fecha de inicio de membresía
    const fechaInicioMembresia = data.fechaInicioMembresia || new Date();

    // Crear el nuevo usuario
    const newUser = await prisma.usuario.create({
      data: {
        nombre: data.nombre.toLowerCase(),
        apellido: data.apellido.toLowerCase(),
        documento: data.documento,
        telefono: data.telefono || null,
        edad: data.edad ? +data.edad : null,
        administradorId: data.administradorId,
        estado: "ACTIVO",
        estaActivo: true,
        fechaInicioMembresia: fechaInicioMembresia,
      },
    });

    // Crear el pago inicial basado en el tipo de configuración
    await createInitialPayment({
      configuracionTarifa,
      newUser,
      primerPagoMesSiguiente: data.primerPagoMesSiguiente,
      fechaInicioMembresia,
    });

    revalidatePath("/admin/users/list");
    return newUser;
  } catch (error) {
    console.error("Error al agregar usuario:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Error desconocido al agregar usuario"
    );
  }
}

// Función auxiliar para crear el pago inicial
async function createInitialPayment({
  configuracionTarifa,
  newUser,
  primerPagoMesSiguiente,
  fechaInicioMembresia,
}: {
  configuracionTarifa: any;
  newUser: any;
  primerPagoMesSiguiente: boolean;
  fechaInicioMembresia: Date;
}) {
  const now = new Date();

  if (
    configuracionTarifa.tipoConfiguracion ===
    TipoConfiguracionTarifa.FIJA_MENSUAL
  ) {
    // Sistema de tarifas fijas mensuales
    const diaDelMes = fechaInicioMembresia.getDate();
    const rangoTarifa = getApplicableTariffRange(
      configuracionTarifa.rangos,
      diaDelMes
    );

    const targetDate = primerPagoMesSiguiente
      ? new Date(now.getFullYear(), now.getMonth() + 1, 1)
      : new Date(now.getFullYear(), now.getMonth(), 1);

    await prisma.pago.create({
      data: {
        año: targetDate.getFullYear(),
        mes: targetDate.getMonth() + 1,
        periodo: `${targetDate.getFullYear()}-${String(
          targetDate.getMonth() + 1
        ).padStart(2, "0")}`,
        monto: rangoTarifa.monto,
        usuarioId: newUser.id,
        estaVencido: false,
        estado: "PENDIENTE",
        metodo: "EFECTIVO",
        comprobante: null,
        fecha: now,
        fechaVencimiento: null, // No se usa en sistema fijo mensual
      },
    });
  } else if (
    configuracionTarifa.tipoConfiguracion ===
    TipoConfiguracionTarifa.DINAMICA_POR_FECHA_INGRESO
  ) {
    // Sistema dinámico por fecha de ingreso
    const fechaVencimiento = new Date(fechaInicioMembresia);

    if (primerPagoMesSiguiente) {
      // Si el primer pago es el mes siguiente, agregar un mes a la fecha de inicio
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);
    }

    // El período se basa en la fecha de vencimiento
    const periodo = `${fechaVencimiento.getFullYear()}-${String(
      fechaVencimiento.getMonth() + 1
    ).padStart(2, "0")}`;

    await prisma.pago.create({
      data: {
        año: fechaVencimiento.getFullYear(),
        mes: fechaVencimiento.getMonth() + 1,
        periodo: periodo,
        monto: configuracionTarifa.montoBase,
        usuarioId: newUser.id,
        estaVencido: false,
        estado: "PENDIENTE",
        metodo: "EFECTIVO",
        comprobante: null,
        fecha: now,
        fechaVencimiento: fechaVencimiento, // Fecha específica de vencimiento
      },
    });
  } else {
    throw new Error("Tipo de configuración de tarifa no válido");
  }
}

// Server Action para obtener información de configuración de tarifas
export async function getTariffConfigurationInfo(administradorId: string) {
  try {
    const configuracion = await prisma.configuracionTarifa.findUnique({
      where: { administradorId },
      include: { rangos: true },
    });

    if (!configuracion) {
      return {
        hasConfiguration: false,
        message:
          "No hay configuración de tarifas. Configure las tarifas antes de agregar usuarios.",
      };
    }

    const validation = validateTariffConfiguration(configuracion);

    return {
      hasConfiguration: true,
      isValid: validation.isValid,
      errors: validation.errors,
      configuracion,
      tipo: configuracion.tipoConfiguracion,
    };
  } catch (error) {
    console.error("Error al obtener configuración de tarifas:", error);
    throw new Error("Error al obtener la configuración de tarifas");
  }
}
