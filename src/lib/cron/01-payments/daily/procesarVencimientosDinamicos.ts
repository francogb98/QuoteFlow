import prisma from "@/lib/prisma";
import { logger } from "../lib";

/**
 * Calcula la fecha de vencimiento del mes actual según la fecha de inicio de membresía
 */
function getMonthlyDueDate(fechaInicio: Date, fechaActual: Date): Date {
  const dueDate = new Date(fechaActual);
  dueDate.setDate(fechaInicio.getDate());
  dueDate.setHours(23, 59, 59, 999); // fin del día

  // Si el día aún no llegó en este mes, retrocedemos al mes anterior
  if (dueDate > fechaActual) {
    dueDate.setMonth(dueDate.getMonth() - 1);
  }

  return dueDate;
}

/**
 * Verifica si el pago mensual está vencido considerando días de gracia
 */
function isMonthlyPaymentOverdue(
  fechaInicio: Date,
  diasGracia: number,
  fechaActual: Date
): boolean {
  const dueDate = getMonthlyDueDate(fechaInicio, fechaActual);
  dueDate.setDate(dueDate.getDate() + diasGracia);
  return fechaActual > dueDate;
}

/**
 * Procesa los pagos dinámicos mensuales
 */
export async function procesarVencimientosDinamicos(fechaActual: Date) {
  let pagosVencidos = 0;
  let recargosAplicados = 0;

  // Traer todos los usuarios activos con configuración dinámica
  const pagosDinamicos = await prisma.pago.findMany({
    where: {
      estado: { in: ["PENDIENTE", "VENCIDO"] },
      usuario: {
        estado: "ACTIVO",
        estaActivo: true,
        fechaInicioMembresia: { not: null, lte: fechaActual },
        dinamicaTarifa: { isNot: null }, // solo usuarios con config dinámica
      },
    },
    include: {
      usuario: { include: { dinamicaTarifa: true } }, // incluimos config dinámica específica del usuario
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

    const vencido = isMonthlyPaymentOverdue(
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
          comprobante:
            montoRecargo > 0
              ? `RECARGO_APLICADO_${montoRecargo}`
              : pago.comprobante,
        },
      });
      pagosVencidos++;
      if (montoRecargo > 0) recargosAplicados++;

      logger.debug(
        `✅ Pago pasado a VENCIDO: Usuario ${usuario.nombre} - Período ${pago.periodo}`
      );
    }

    // CASO 2: aplique el recargo de todas maneras si ya está vencido
    if (pago.estado === "VENCIDO" && montoRecargo > 0) {
      await prisma.pago.update({
        where: { id: pago.id },
        data: {
          monto: montoRecargo,
          comprobante: `RECARGO_APLICADO_${montoRecargo}`,
        },
      });
      recargosAplicados++;

      logger.debug(
        `⚡ Recargo aplicado a pago ya vencido: Usuario ${usuario.nombre} - Período ${pago.periodo}`
      );
    }
  }

  return { pagosVencidos, recargosAplicados };
}
