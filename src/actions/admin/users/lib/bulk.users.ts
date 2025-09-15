"use server";

import { revalidatePath } from "next/cache";
import { TipoConfiguracionTarifa } from "@prisma/client";
import prisma from "@/lib/prisma";
import { auth } from "@/*";

export interface BulkUserData {
  nombre: string;
  apellido: string;
  documento: string;
  rangoTarifaId?: string;
  dinamicaTarifaId?: string;
  fechaInicioMembresia: string; // obligatorio siempre
  primerPagoMesSiguiente?: boolean; // ahora por usuario
}

export interface BulkUserCreationData {
  users: BulkUserData[];
  administradorId: string;
}

export async function addBulkUsersToAdmin(data: BulkUserCreationData) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Usuario no autenticado");
  }

  const adminId = session.user.id;

  try {
    // Verificar que el administrador existe y obtener su configuración de tarifas
    const adminExists = await prisma.administrador.findUnique({
      where: { id: adminId },
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

    // Validaciones de tarifas por usuario
    for (const user of data.users) {
      if (isDynamicTariff) {
        if (!user.dinamicaTarifaId) {
          throw new Error(
            `El usuario ${user.documento} debe tener una configuración dinámica`
          );
        }
        const dinamicaExists = configuracionTarifa.dinamicas.find(
          (d) => d.id === user.dinamicaTarifaId
        );
        if (!dinamicaExists) {
          throw new Error(
            `La configuración dinámica para el usuario ${user.documento} no existe`
          );
        }
      } else {
        if (!user.rangoTarifaId) {
          throw new Error(
            `El usuario ${user.documento} debe tener un rango de tarifa`
          );
        }
        const rangoExists = configuracionTarifa.rangos.find(
          (r) => r.id === user.rangoTarifaId
        );
        if (!rangoExists) {
          throw new Error(
            `El rango de tarifa para el usuario ${user.documento} no existe`
          );
        }
      }
    }

    // Verificar documentos duplicados en el lote
    const documentos = data.users.map((user) => user.documento);
    const duplicateDocuments = documentos.filter(
      (doc, index) => documentos.indexOf(doc) !== index
    );
    if (duplicateDocuments.length > 0) {
      throw new Error(
        `Documentos duplicados en el lote: ${duplicateDocuments.join(", ")}`
      );
    }

    // Verificar si algún usuario ya existe
    const existingUsers = await prisma.usuario.findMany({
      where: {
        documento: { in: documentos },
        administradorId: adminId,
      },
    });

    if (existingUsers.length > 0) {
      const existingDocs = existingUsers.map((u) => u.documento).join(", ");
      throw new Error(
        `Ya existen usuarios con estos documentos: ${existingDocs}`
      );
    }

    const results = {
      created: [] as any[],
      errors: [] as { documento: string; error: string }[],
    };

    // Crear usuarios en lote usando transacción
    await prisma.$transaction(async (tx) => {
      for (const userData of data.users) {
        try {
          if (!userData.fechaInicioMembresia) {
            throw new Error(
              `El usuario ${userData.documento} no tiene fecha de inicio`
            );
          }

          // ✅ Parseo seguro sin timezone shift
          const [year, month, day] = userData.fechaInicioMembresia
            .split("-")
            .map(Number);
          const fechaInicioMembresiaUsuario = new Date(year, month - 1, day);

          const newUser = await tx.usuario.create({
            data: {
              nombre: userData.nombre.toLowerCase(),
              apellido: userData.apellido.toLowerCase(),
              documento: userData.documento,
              telefono: null,
              edad: null,
              administradorId: adminId,
              estado: "ACTIVO",
              estaActivo: true,
              fechaInicioMembresia: fechaInicioMembresiaUsuario,
              rangoTarifaId: isDynamicTariff ? null : userData.rangoTarifaId,
              dinamicaTarifaId: isDynamicTariff
                ? userData.dinamicaTarifaId
                : null,
            },
          });

          await createInitialPaymentForBulk({
            tx,
            configuracionTarifa,
            newUser,
            primerPagoMesSiguiente: userData.primerPagoMesSiguiente ?? false,
            fechaInicioMembresia: fechaInicioMembresiaUsuario,
            selectedRangoId: userData.rangoTarifaId,
            selectedDinamicaId: userData.dinamicaTarifaId,
          });

          results.created.push(newUser);
        } catch (error) {
          results.errors.push({
            documento: userData.documento,
            error: error instanceof Error ? error.message : "Error desconocido",
          });
        }
      }
    });

    revalidatePath("/admin/users");

    return {
      success: true,
      created: results.created.length,
      errors: results.errors,
      message: `Se crearon ${results.created.length} usuarios exitosamente${
        results.errors.length > 0 ? ` con ${results.errors.length} errores` : ""
      }`,
    };
  } catch (error) {
    console.error("Error al agregar usuarios en lote:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Error en el servidor intente nuevamente más tarde."
    );
  }
}

async function createInitialPaymentForBulk({
  tx,
  configuracionTarifa,
  newUser,
  primerPagoMesSiguiente,
  fechaInicioMembresia,
  selectedRangoId,
  selectedDinamicaId,
}: {
  tx: any;
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
    const rangoTarifa = configuracionTarifa.rangos.find(
      (r: any) => r.id === selectedRangoId
    );
    if (!rangoTarifa) {
      throw new Error("Rango de tarifa no encontrado");
    }

    const targetDate = primerPagoMesSiguiente
      ? new Date(now.getFullYear(), now.getMonth() + 1, 1)
      : new Date(now.getFullYear(), now.getMonth(), 1);

    await tx.pago.create({
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

    await tx.pago.create({
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
