"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { TipoConfiguracionTarifa } from "@prisma/client";

interface RangoData {
  id?: string;
  nombre: string;
  diaInicio: number;
  diaFin: number;
  monto: number;
}

interface DinamicaData {
  id?: string;
  nombre: string;
  montoBase: number;
  diasGracia: number;
  montoRecargo: number;
}

interface ActualizarTarifaData {
  id: string;
  tipoConfiguracion: TipoConfiguracionTarifa;
  rangos?: RangoData[];
  dinamicas?: DinamicaData[];
}

// Función para actualizar, crear o eliminar rangos
async function upsertRangos(configuracionTarifaId: string, rangos: RangoData[]) {
  const idsEnviados = rangos.filter((r): r is RangoData & { id: string } => !!r.id).map((r) => r.id);

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
  dinamicas: DinamicaData[]
) {
  const idsEnviados = dinamicas.filter((d): d is DinamicaData & { id: string } => !!d.id).map((d) => d.id);

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
export async function actualizarConfiguracionTarifa(data: ActualizarTarifaData) {
  try {
    const { id, tipoConfiguracion, rangos, dinamicas } = data;

    // 1. Actualizar configuración principal
    await prisma.configuracionTarifa.update({
      where: { id },
      data: { tipoConfiguracion },
    });

    // 2. Actualizar rangos y dinamicas
    if (Array.isArray(rangos)) {
      await upsertRangos(id, rangos);
    }
    if (Array.isArray(dinamicas)) {
      await upsertDinamicas(id, dinamicas);
    }

    // 3. Obtener configuración actualizada (con rangos/dinamicas)
    const config = await prisma.configuracionTarifa.findUnique({
      where: { id },
      include: { rangos: true, dinamicas: true },
    });

    if (!config) {
      return { ok: false, error: "Tarifa no encontrada" };
    }

    // 4. Obtener usuarios asociados a esa tarifa
    const usuarios = await prisma.usuario.findMany({
      where: {
        OR: [
          { rangoTarifa: { configuracionTarifaId: id } },
          { dinamicaTarifa: { configuracionTarifaId: id } },
        ],
      },
      select: {
        id: true,
        rangoTarifa: { select: { monto: true } },
        dinamicaTarifa: { select: { montoBase: true } },
      },
    });

    // 5. Calcular montos y actualizar en batch (una sola query en lugar de N)
    const updates: Promise<unknown>[] = [];
    for (const usuario of usuarios) {
      let nuevoMonto = 0;

      if (tipoConfiguracion === "FIJA_MENSUAL") {
        if (!usuario.rangoTarifa) continue;
        nuevoMonto = usuario.rangoTarifa.monto;
      }

      if (tipoConfiguracion === "DINAMICA_POR_FECHA_INGRESO") {
        if (!usuario.dinamicaTarifa) continue;
        nuevoMonto = usuario.dinamicaTarifa.montoBase;
      }

      updates.push(
        prisma.pago.updateMany({
          where: { usuarioId: usuario.id, estado: "PENDIENTE" },
          data: { monto: nuevoMonto },
        })
      );
    }
    await Promise.all(updates);

    revalidatePath(`/admin/settings`);
    revalidatePath(`/admin/users`);
    revalidatePath(`/admin/home`);

    return {
      ok: true,
      configActualizada: config,
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
      error: "Error al actualizar la configuración de tarifa",
    };
  }
}
