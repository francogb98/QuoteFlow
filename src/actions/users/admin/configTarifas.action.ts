"use server";

import { auth } from "@/*";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function crearTarifas(data: any) {
  try {
    const { diaInicio, diaFin, monto, estaActiva } = data;

    const session = await auth();
    if (!session?.user) {
      return {
        ok: false,
        message: "No estás logueado",
      };
    }

    const { id: administradorId } = session.user;

    if (!administradorId) {
      return {
        ok: false,
        message: "No se pudo obtener el ID del administrador",
      };
    }

    const isExistingConfig = await prisma.configuracionTarifa.findFirst({
      where: { administradorId },
      include: { rangos: true },
    });

    // VALIDAR SOLAPAMIENTO
    const solapado = isExistingConfig?.rangos.some(
      (rango) => diaInicio <= rango.diaFin && diaFin >= rango.diaInicio
    );

    if (solapado) {
      return {
        ok: false,
        message: "El nuevo rango se superpone con uno existente",
      };
    }

    let nuevaConfiguracion;

    if (!isExistingConfig) {
      nuevaConfiguracion = await prisma.configuracionTarifa.create({
        data: {
          administradorId,
          estaActiva,
          rangos: {
            create: {
              diaInicio,
              diaFin,
              monto,
            },
          },
        },
      });
    } else {
      nuevaConfiguracion = await prisma.configuracionTarifa.update({
        where: { id: isExistingConfig.id },
        data: {
          rangos: {
            create: {
              diaInicio,
              diaFin,
              monto,
            },
          },
        },
      });
    }

    revalidatePath("/admin/settings");

    return {
      ok: true,
      message: "Configuración guardada exitosamente",
      configuracion: nuevaConfiguracion,
    };
  } catch (error) {
    console.error("Error al crear tarifas:", error);
    return {
      ok: false,
      message: "Error al guardar la configuración",
      error,
    };
  }
}

export async function updateRangoTarifas(data: any) {
  try {
    const { configuracionTarifaId, monto, diaInicio, diaFin, tarifaId } = data;

    // Obtener todos los rangos actuales excepto el que se va a actualizar
    const configuracion = await prisma.configuracionTarifa.findUnique({
      where: { id: configuracionTarifaId },
      include: { rangos: true },
    });

    if (!configuracion) {
      return { ok: false, message: "No se encontró la configuración" };
    }

    const solapado = configuracion.rangos.some(
      (rango) =>
        rango.id !== tarifaId &&
        diaInicio <= rango.diaFin &&
        diaFin >= rango.diaInicio
    );

    if (solapado) {
      return {
        ok: false,
        message: "El nuevo rango se superpone con uno existente",
      };
    }

    await prisma.rangoTarifa.updateMany({
      where: { configuracionTarifaId, id: tarifaId },
      data: {
        monto: +monto,
        diaInicio: +diaInicio,
        diaFin: +diaFin,
      },
    });
    revalidatePath("/admin/settings");
    return { ok: true, message: "Tarifas actualizadas exitosamente" };
  } catch (error) {
    console.error("Error al actualizar tarifas:", error);
    return { ok: false, message: "Error al obtener las tarifas" };
  }
}
