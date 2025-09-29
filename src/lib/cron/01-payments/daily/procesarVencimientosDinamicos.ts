"use server";

import prisma from "@/lib/prisma";
import { logger } from "../lib";
import {
  getNormalizedBusinessDate,
  isDynamicPaymentOverdue,
} from "../utils/dateUtils";

export async function procesarVencimientosDinamicos(fecha?: Date) {
  const fechaActual = fecha || getNormalizedBusinessDate();
  let pagosVencidos = 0;
  let recargosAplicados = 0;

  // Traer pagos pendientes o vencidos del mes actual
  const pagosDinamicos = await prisma.pago.findMany({
    where: {
      estado: { in: ["PENDIENTE", "VENCIDO"] },
      mes: fechaActual.getMonth() + 1,
      año: fechaActual.getFullYear(),
      usuario: {
        estado: "ACTIVO",
        estaActivo: true,
        fechaInicioMembresia: { not: null, lte: fechaActual },
        dinamicaTarifa: { isNot: null }, // solo usuarios con config dinámica
      },
    },
    include: {
      usuario: { include: { dinamicaTarifa: true } },
    },
  });

  logger.info(
    `🔍 Encontrados ${pagosDinamicos.length} pagos dinámicos para verificar vencimiento`
  );

  for (const pago of pagosDinamicos) {
    const usuario = pago.usuario;
    const config = usuario.dinamicaTarifa;
    if (!usuario.fechaInicioMembresia || !config) continue;

    const diasGracia = config.diasGracia || 0;
    const montoRecargo = config.montoRecargo || 0;

    const vencido = isDynamicPaymentOverdue(
      usuario.fechaInicioMembresia,
      diasGracia,
      fechaActual
    );

    if (!vencido) continue;

    // CASO 1: Pago aún pendiente → pasarlo a VENCIDO
    if (pago.estado === "PENDIENTE") {
      await prisma.pago.update({
        where: { id: pago.id },
        data: {
          estado: "VENCIDO",
          estaVencido: true,
          monto: montoRecargo > 0 ? montoRecargo : pago.monto,
        },
      });
      pagosVencidos++;
      if (montoRecargo > 0) recargosAplicados++;

      logger.debug(
        `✅ Pago pasado a VENCIDO: Usuario ${usuario.nombre} - Período ${pago.periodo}`
      );
    }

    // CASO 2: Pago ya vencido → aplicar recargo si corresponde
    if (pago.estado === "VENCIDO" && montoRecargo > 0) {
      await prisma.pago.update({
        where: { id: pago.id },
        data: { monto: montoRecargo },
      });
      recargosAplicados++;
      logger.debug(
        `⚡ Recargo aplicado a pago ya vencido: Usuario ${usuario.nombre} - Período ${pago.periodo}`
      );
    }
  }

  return { pagosVencidos, recargosAplicados };
}
