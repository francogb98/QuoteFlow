import prisma from "@/lib/prisma";
import { generarProximoPago, logger } from "../lib";

export async function processMonthlyPaymentGeneration() {
  const tiempoInicio = Date.now();
  const fechaActual = new Date();
  const mesActual = fechaActual.getMonth() + 1;
  const añoActual = fechaActual.getFullYear();
  const proximoMes = mesActual === 12 ? 1 : mesActual + 1;
  const proximoAño = mesActual === 12 ? añoActual + 1 : añoActual;

  logger.info(
    `📅 [MENSUAL] Generando pagos para usuarios con pago actual pendiente: ${mesActual}/${añoActual}`,
  );

  const usuariosParaGenerar = await prisma.usuario.findMany({
    where: {
      estado: "ACTIVO",
      estaActivo: true,
      // Exclude users belonging to SUPER_ADMIN accounts — they are not subject to billing
      administrador: { rol: { not: "SUPER_ADMIN" } },
      // Tienen al menos un pago PENDIENTE o VENCIDO este mes
      pagos: {
        some: {
          mes: mesActual,
          año: añoActual,
          estado: { in: ["PENDIENTE", "VENCIDO"] },
        },
      },
      // NO tienen pago del mes siguiente
      NOT: {
        pagos: {
          some: {
            mes: proximoMes,
            año: proximoAño,
          },
        },
      },
    },
    include: {
      administrador: {
        include: {
          configuracionTarifa: {
            include: { rangos: true },
          },
        },
      },
      pagos: {
        where: {
          mes: mesActual,
          año: añoActual,
        },
        orderBy: { fecha: "desc" },
        take: 1,
      },
    },
  });

  logger.info(
    `👥 [MENSUAL] Encontrados ${usuariosParaGenerar.length} usuarios con pagos pendientes`,
  );

  let pagosGenerados = 0;

  for (const usuario of usuariosParaGenerar) {
    const configuracion = usuario.administrador.configuracionTarifa;
    if (!configuracion) continue;

    const pagoActual = usuario.pagos[0];
    if (!pagoActual) continue;

    try {
      const nuevoPago = await generarProximoPago(
        usuario,
        configuracion,
        pagoActual,
        fechaActual,
      );
      if (nuevoPago) {
        pagosGenerados++;
        logger.debug(
          `✅ [MENSUAL] Pago generado: ${usuario.nombre} - ${nuevoPago.periodo}`,
        );
      }
    } catch (error) {
      logger.error(
        `❌ [MENSUAL] Error generando pago para ${usuario.nombre}:`,
        error,
      );
    }
  }

  const tiempoEjecucion = Date.now() - tiempoInicio;

  logger.info(
    `✅ [MENSUAL] Generación completada en ${tiempoEjecucion}ms: ${pagosGenerados} pagos generados`,
  );

  return {
    pagosGenerados,
    usuariosProcesados: usuariosParaGenerar.length,
    tiempoEjecucion,
    tipo: "mensual",
  };
}
