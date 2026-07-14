"use server";

import { revalidatePath } from "next/cache";
import { TipoConfiguracionTarifa } from "@prisma/client";
import prisma from "@/lib/prisma";
import { createInitialPayment } from "@/lib/payments/createInitialPayment";
import { ActionResponse, handleActionError } from "@/lib/utils/action-errors";

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
}): Promise<ActionResponse<any>> {
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
    const fechaInicioMembresia = data.fechaInicioMembresia || new Date();

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
    return { success: true, data: newUser, message: "Usuario agregado exitosamente." };
  } catch (error) {
    return handleActionError(error, "Error al agregar usuario");
  }
}
