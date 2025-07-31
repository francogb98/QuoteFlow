import prisma from "@/lib/prisma";
import { logger, isPaymentOverdue } from "../lib";

export async function procesarVencimientosDinamicos(fechaActual: Date) {
  let pagosVencidos = 0;
  let recargosAplicados = 0;

  // Solo traer pagos con configuración dinámica que pueden estar vencidos
  const pagosDinamicos = await prisma.pago.findMany({
    where: {
      estado: "PENDIENTE",
      fechaVencimiento: {
        not: null,
        lte: fechaActual, // Solo pagos que ya deberían haber vencido
      },
      usuario: {
        estado: "ACTIVO",
        estaActivo: true,
        administrador: {
          configuracionTarifa: {
            tipoConfiguracion: "DINAMICA_POR_FECHA_INGRESO",
          },
        },
      },
    },
    include: {
      usuario: {
        include: {
          administrador: {
            include: {
              configuracionTarifa: true,
            },
          },
        },
      },
    },
  });

  logger.info(
    `🔍 Encontrados ${pagosDinamicos.length} pagos dinámicos para verificar vencimiento`
  );

  for (const pago of pagosDinamicos) {
    const configuracion = pago.usuario.administrador.configuracionTarifa!;
    const diasGracia = configuracion.diasGracia || 0;

    if (isPaymentOverdue(pago.fechaVencimiento!, diasGracia, fechaActual)) {
      const montoRecargo = configuracion.montoRecargo || 0;

      await prisma.pago.update({
        where: { id: pago.id },
        data: {
          estado: "VENCIDO",
          estaVencido: true,
          monto: montoRecargo > 0 ? montoRecargo : pago.monto,
          comprobante:
            montoRecargo > 0
              ? `RECARGO_APLICADO_${montoRecargo}`
              : pago.comprobante,
        },
      });

      pagosVencidos++;
      if (montoRecargo > 0) recargosAplicados++;

      logger.debug(
        `Pago vencido: Usuario ${pago.usuario.nombre} - Período ${pago.periodo}`
      );
    }
  }

  return { pagosVencidos, recargosAplicados };
}
