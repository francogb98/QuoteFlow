"use server";

import { revalidatePath } from "next/cache";
import { TipoConfiguracionTarifa } from "@prisma/client";
import prisma from "@/lib/prisma";

export async function addUserToAdmin(data: {
  nombre: string;
  apellido: string;
  documento: string;
  edad?: number;
  telefono?: string;
  correo?: string;
  administradorId: string;
  primerPagoMesSiguiente: boolean;
  fechaInicioMembresia?: Date;
  rangoTarifaId?: string;
  dinamicaTarifaId?: string;
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
            dinamicas: true,
          },
        },
      },
    });

    if (!adminExists) {
      throw new Error("Administrador no encontrado");
    }

    if (!adminExists.configuracionTarifa) {
      throw new Error("No hay configuración de tarifas disponible");
    }

    const configuracionTarifa = adminExists.configuracionTarifa;
    const isDynamicTariff =
      configuracionTarifa.tipoConfiguracion ===
      TipoConfiguracionTarifa.DINAMICA_POR_FECHA_INGRESO;

    if (isDynamicTariff) {
      if (!data.dinamicaTarifaId) {
        throw new Error("Debe seleccionar una configuración dinámica");
      }
      const dinamicaExists = configuracionTarifa.dinamicas.find(
        (d) => d.id === data.dinamicaTarifaId
      );
      if (!dinamicaExists) {
        throw new Error("La configuración dinámica seleccionada no existe");
      }
    } else {
      if (!data.rangoTarifaId) {
        throw new Error("Debe seleccionar un rango de tarifa");
      }
      const rangoExists = configuracionTarifa.rangos.find(
        (r) => r.id === data.rangoTarifaId
      );
      if (!rangoExists) {
        throw new Error("El rango de tarifa seleccionado no existe");
      }
    }

    // Determinar la fecha de inicio de membresía
    const fechaInicioMembresia =
      new Date(data.fechaInicioMembresia!) || new Date();

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
        // Assign the selected tariff
        rangoTarifaId: isDynamicTariff ? null : data.rangoTarifaId,
        dinamicaTarifaId: isDynamicTariff ? data.dinamicaTarifaId : null,
      },
    });

    await createInitialPayment({
      configuracionTarifa,
      newUser,
      primerPagoMesSiguiente: data.primerPagoMesSiguiente,
      fechaInicioMembresia,
      selectedRangoId: data.rangoTarifaId,
      selectedDinamicaId: data.dinamicaTarifaId,
    });

    revalidatePath("/admin/users/list");
    return newUser;
  } catch (error) {
    console.error("Error al agregar usuario:", error);
    throw new Error("Error en el servidor intente nuevamente más tarde.");
  }
}

async function createInitialPayment({
  configuracionTarifa,
  newUser,
  primerPagoMesSiguiente,
  fechaInicioMembresia,
  selectedRangoId,
  selectedDinamicaId,
}: {
  configuracionTarifa: any;
  newUser: any;
  primerPagoMesSiguiente: boolean;
  fechaInicioMembresia: Date;
  selectedRangoId?: string;
  selectedDinamicaId?: string;
}) {
  const now = new Date();

  if (
    configuracionTarifa.tipoConfiguracion ===
    TipoConfiguracionTarifa.FIJA_MENSUAL
  ) {
    // Use selected range tariff
    const rangoTarifa = configuracionTarifa.rangos.find(
      (r: any) => r.id === selectedRangoId
    );
    if (!rangoTarifa) {
      throw new Error("Rango de tarifa no encontrado");
    }

    const targetDate = primerPagoMesSiguiente
      ? new Date(now.getFullYear(), now.getMonth() + 1, 1)
      : new Date(now.getFullYear(), now.getMonth(), 1);

    await prisma.pago.create({
      data: {
        año: targetDate.getFullYear(),
        mes: targetDate.getMonth() + 1,
        periodo: `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, "0")}`,
        monto: rangoTarifa.monto,
        usuarioId: newUser.id,
        estaVencido: false,
        estado: "PENDIENTE",
        metodo: "EFECTIVO",
        comprobante: null,
        fecha: now,
        fechaVencimiento: null,
      },
    });
  } else if (
    configuracionTarifa.tipoConfiguracion ===
    TipoConfiguracionTarifa.DINAMICA_POR_FECHA_INGRESO
  ) {
    // Use selected dynamic configuration
    const dinamicaTarifa = configuracionTarifa.dinamicas.find(
      (d: any) => d.id === selectedDinamicaId
    );
    if (!dinamicaTarifa) {
      throw new Error("Configuración dinámica no encontrada");
    }

    const fechaVencimiento = new Date(fechaInicioMembresia);

    if (primerPagoMesSiguiente) {
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);
    }

    const periodo = `${fechaVencimiento.getFullYear()}-${String(fechaVencimiento.getMonth() + 1).padStart(2, "0")}`;

    await prisma.pago.create({
      data: {
        año: fechaVencimiento.getFullYear(),
        mes: fechaVencimiento.getMonth() + 1,
        periodo: periodo,
        monto: dinamicaTarifa.montoBase,
        usuarioId: newUser.id,
        estaVencido: false,
        estado: "PENDIENTE",
        metodo: "EFECTIVO",
        comprobante: null,
        fecha: now,
        fechaVencimiento: fechaVencimiento,
      },
    });
  } else {
    throw new Error("Tipo de configuración de tarifa no válido");
  }
}
