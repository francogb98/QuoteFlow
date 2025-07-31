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

  // Buscar usuarios que ya pagaron este mes y no tienen pago del mes siguiente
  const usuariosParaGenerar = await prisma.usuario.findMany({
    where: {
      estado: "ACTIVO",
      estaActivo: true,
      // Tienen al menos un pago PAGADO este mes
      pagos: {
        some: {
          mes: mesActual,
          año: añoActual,
          estado: "PAGADO",
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
          estado: "PAGADO",
        },
        orderBy: { fecha: "desc" },
        take: 1,
      },
    },
  });

  logger.info(
    `👥 Encontrados ${usuariosParaGenerar.length} usuarios que ya pagaron y necesitan próximo pago`
  );

  for (const usuario of usuariosParaGenerar) {
    const configuracion = usuario.administrador.configuracionTarifa;
    if (!configuracion) continue;

    const ultimoPagoPagado = usuario.pagos[0];
    if (!ultimoPagoPagado) continue;

    try {
      const nuevoPago = await generarProximoPago(
        usuario,
        configuracion,
        ultimoPagoPagado,
        fechaActual
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
