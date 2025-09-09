import prisma from "@/lib/prisma";
import { findTarifaRangeForDate, logger } from "../lib";

export async function actualizarTarifasFijas(
  fechaActual: Date,
  diaActual: number,
  mesActual: number,
  añoActual: number
) {
  let tarifasActualizadas = 0;

  // Obtener configuraciones fijas que tienen cambios de tarifa HOY
  const configuracionesFijas = await prisma.configuracionTarifa.findMany({
    where: {
      tipoConfiguracion: "FIJA_MENSUAL",
      estaActiva: true,
      rangos: {
        some: {
          OR: [{ diaInicio: diaActual }, { diaFin: diaActual }],
        },
      },
    },
    include: {
      rangos: {
        orderBy: { diaInicio: "asc" },
      },
      administradores: true, // 🔹 Ahora es un array
    },
  });

  if (configuracionesFijas.length === 0) {
    logger.info(
      `📅 No hay cambios de tarifa programados para el día ${diaActual}`
    );
    return { tarifasActualizadas };
  }

  logger.info(
    `📅 Procesando ${configuracionesFijas.length} configuraciones con cambios de tarifa hoy`
  );

  for (const configuracion of configuracionesFijas) {
    const rangoActual = findTarifaRangeForDate(
      configuracion.rangos,
      fechaActual
    );
    if (!rangoActual) continue;

    // Iterar sobre todos los administradores vinculados
    for (const admin of configuracion.administradores) {
      // Actualizar pagos pendientes de este mes para los usuarios de este admin
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
          monto: { not: rangoActual.monto }, // Solo los que necesitan actualización
        },
        data: {
          monto: rangoActual.monto,
          comprobante: `RANGO_${rangoActual.diaInicio}-${rangoActual.diaFin}_$${rangoActual.monto}`,
        },
      });

      tarifasActualizadas += resultadoUpdate.count;

      if (resultadoUpdate.count > 0) {
        logger.info(
          `💰 Actualizados ${resultadoUpdate.count} pagos a $${rangoActual.monto} para administrador ${admin.nombre}`
        );
      }
    }
  }

  return { tarifasActualizadas };
}
