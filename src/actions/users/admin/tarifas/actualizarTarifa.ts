"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Función para actualizar, crear o eliminar rangos
async function upsertRangos(configuracionTarifaId: string, rangos: any[]) {
  const idsEnviados = rangos.filter((r) => r.id).map((r) => r.id);

  // Elimina los rangos que no están en la lista enviada
  await prisma.rangoTarifa.deleteMany({
    where: {
      configuracionTarifaId,
      NOT: { id: { in: idsEnviados } },
    },
  });

  // Crea o actualiza cada rango
  for (const rango of rangos) {
    if (rango.id) {
      await prisma.rangoTarifa.update({
        where: { id: rango.id },
        data: {
          nombre: rango.nombre,
          diaInicio: rango.diaInicio,
          diaFin: rango.diaFin,
          monto: rango.monto,
        },
      });
    } else {
      await prisma.rangoTarifa.create({
        data: {
          nombre: rango.nombre,
          diaInicio: rango.diaInicio,
          diaFin: rango.diaFin,
          monto: rango.monto,
          configuracionTarifaId,
        },
      });
    }
  }
}

// Función para actualizar, crear o eliminar dinámicas
async function upsertDinamicas(
  configuracionTarifaId: string,
  dinamicas: any[]
) {
  const idsEnviados = dinamicas.filter((d) => d.id).map((d) => d.id);

  // Elimina las dinámicas que no están en la lista enviada
  await prisma.configuracionDinamicaTarifa.deleteMany({
    where: {
      configuracionTarifaId,
      NOT: { id: { in: idsEnviados } },
    },
  });

  // Crea o actualiza cada dinámica
  for (const dinamica of dinamicas) {
    if (dinamica.id) {
      await prisma.configuracionDinamicaTarifa.update({
        where: { id: dinamica.id },
        data: {
          nombre: dinamica.nombre,
          montoBase: dinamica.montoBase,
          diasGracia: dinamica.diasGracia,
          montoRecargo: dinamica.montoRecargo,
        },
      });
    } else {
      await prisma.configuracionDinamicaTarifa.create({
        data: {
          nombre: dinamica.nombre,
          montoBase: dinamica.montoBase,
          diasGracia: dinamica.diasGracia,
          montoRecargo: dinamica.montoRecargo,
          configuracionTarifaId,
        },
      });
    }
  }
}

// Controlador principal para actualizar la configuración de tarifa
export async function actualizarConfiguracionTarifa(data: any) {
  try {
    const { id, tipoConfiguracion, rangos, dinamicas } = data;

    // Actualiza la configuración principal
    const tarifaUpdate = await prisma.configuracionTarifa.update({
      where: { id },
      data: { tipoConfiguracion },
    });

    // Actualiza rangos y dinámicas usando funciones auxiliares
    if (Array.isArray(rangos)) {
      await upsertRangos(id, rangos);
    }
    if (Array.isArray(dinamicas)) {
      await upsertDinamicas(id, dinamicas);
    }

    // Devuelve la configuración actualizada con relaciones
    const configActualizada = await prisma.configuracionTarifa.findUnique({
      where: { id },
      include: { rangos: true, dinamicas: true },
    });

    revalidatePath(`/admin/settings`);
    return { ok: true, configActualizada };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
      error: "Error al actualizar la configuración de tarifa",
    };
  }
}
