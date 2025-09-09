import prisma from "@/lib/prisma";
import { logger, generarProximoPago } from "../lib";

export async function generarPagosFuturos(
  fechaActual: Date,
  mesActual: number,
  añoActual: number
) {
  let pagosGenerados = 0;
  const proximoMes = mesActual === 12 ? 1 : mesActual + 1;
  const proximoAño = mesActual === 12 ? añoActual + 1 : añoActual;

  // Busca usuarios que están activos
  const usuariosActivos = await prisma.usuario.findMany({
    where: {
      estado: "ACTIVO",
      estaActivo: true,
      // NO tienen un pago del mes actual o del próximo
      NOT: {
        pagos: {
          some: {
            mes: { in: [mesActual, proximoMes] },
            año: { in: [añoActual, proximoAño] },
            estado: "PENDIENTE",
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
          estado: "PAGADO",
        },
        orderBy: {
          fecha: "desc",
        },
        take: 1,
      },
    },
  });

  logger.info(
    `👥 Encontrados ${usuariosActivos.length} usuarios que necesitan pagos futuros`
  );

  for (const usuario of usuariosActivos) {
    const configuracion = usuario.administrador.configuracionTarifa;
    const ultimoPagoPagado = usuario.pagos[0];

    // Se salta el usuario si no tiene una configuración de tarifa o un pago pagado
    if (!configuracion || !ultimoPagoPagado) {
      if (!configuracion) {
        logger.warn(
          `⚠️ Usuario ${usuario.nombre} no tiene configuración de tarifa. Saltando...`
        );
      }
      if (!ultimoPagoPagado) {
        logger.warn(
          `⚠️ Usuario ${usuario.nombre} no tiene pagos pagados. Saltando...`
        );
      }
      continue;
    }

    try {
      // Genera el pago para el mes siguiente al último pago pagado
      const proximoPagoMes =
        ultimoPagoPagado.mes === 12 ? 1 : ultimoPagoPagado.mes + 1;
      const proximoPagoAño =
        ultimoPagoPagado.mes === 12
          ? ultimoPagoPagado.año + 1
          : ultimoPagoPagado.año;
      const fechaProximoPago = new Date(proximoPagoAño, proximoPagoMes - 1, 1);

      const nuevoPago = await generarProximoPago(
        usuario,
        configuracion,
        ultimoPagoPagado,
        fechaProximoPago
      );

      if (nuevoPago) {
        pagosGenerados++;
        logger.debug(
          `✅ Pago futuro generado: ${usuario.nombre} - ${nuevoPago.periodo}`
        );
      }
    } catch (error) {
      logger.error(
        `❌ Error generando pago futuro para ${usuario.nombre}:`,
        error
      );
    }
  }

  return { pagosGenerados };
}
