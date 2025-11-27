"use server";
import prisma from "@/lib/prisma";
import { findTarifaRangeForDate, logger } from "../lib";

export async function actualizarTarifasFijas(
  fechaActual: Date,
  diaActual: number,
  mesActual: number,
  añoActual: number,
  cronId: string
) {
  let tarifasActualizadas = 0;

  const configuracionesFijas = await prisma.configuracionTarifa.findMany({
    where: {
      tipoConfiguracion: "FIJA_MENSUAL",
      estaActiva: true,
      rangos: {
        some: { OR: [{ diaInicio: diaActual }, { diaFin: diaActual }] },
      },
    },
    include: {
      rangos: { orderBy: { diaInicio: "asc" } },
      administradores: true,
    },
  });

  if (!configuracionesFijas.length) {
    logger.info(
      `[${cronId}] No hay cambios de tarifa programados para el día ${diaActual}`
    );
    return { tarifasActualizadas };
  }

  logger.info(
    `[${cronId}] Procesando ${configuracionesFijas.length} configuraciones fijas con cambios hoy`
  );

  for (const configuracion of configuracionesFijas) {
    const rangoActual = findTarifaRangeForDate(
      configuracion.rangos,
      fechaActual
    );
    if (!rangoActual) continue;

    const resultados = await Promise.allSettled(
      configuracion.administradores.map(async (admin) => {
        const resultadoUpdate = await prisma.pago.updateMany({
          where: {
            estado: "PENDIENTE",
            mes: mesActual,
            año: añoActual,
            usuario: {
              administradorId: admin.id,
              estado: "ACTIVO",
              estaActivo: true,
            },
            monto: { not: rangoActual.monto },
          },
          data: {
            monto: rangoActual.monto,
            comprobante: `RANGO_${rangoActual.diaInicio}-${rangoActual.diaFin}_$${rangoActual.monto}`,
          },
        });

        if (resultadoUpdate.count > 0) {
          logger.info(
            `[${cronId}] 💰 Actualizados ${resultadoUpdate.count} pagos a $${rangoActual.monto} para admin ${admin.nombre}`
          );
        }

        return resultadoUpdate.count;
      })
    );

    tarifasActualizadas += resultados.reduce(
      (acc, r) => (r.status === "fulfilled" ? acc + r.value : acc),
      0
    );
  }

  return { tarifasActualizadas };
}
