import prisma from "@/lib/prisma";
import { logger } from "../lib";

/**
 * Calcula la fecha de vencimiento del mes actual según la fecha de inicio de membresía
 */
function getMonthlyDueDate(fechaInicio: Date, fechaActual: Date): Date {
  const year = fechaActual.getFullYear();
  const month = fechaActual.getMonth();
  const day = fechaInicio.getDate();

  // Ver cuántos días tiene el mes actual
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  const dueDay = Math.min(day, lastDayOfMonth);

  let dueDate = new Date(year, month, dueDay, 23, 59, 59, 999);

  // Si la fecha aún no llegó en este mes (ej: hoy 10 y vencimiento es 15),
  // mantenemos este mes. Si ya pasó, lo dejamos así.
  // Si es el mismo día, se queda en este mes.
  if (
    dueDate.getTime() > fechaActual.getTime() &&
    dueDate.getDate() !== fechaActual.getDate()
  ) {
    // Retroceder al mes anterior
    const prevMonth = new Date(year, month - 1, 1);
    const lastDayPrevMonth = new Date(year, month, 0).getDate();
    const prevDueDay = Math.min(day, lastDayPrevMonth);
    dueDate = new Date(
      prevMonth.getFullYear(),
      prevMonth.getMonth(),
      prevDueDay,
      23,
      59,
      59,
      999
    );
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
      mes: fechaActual.getMonth() + 1, // en JS los meses van 0-11, por eso +1
      año: fechaActual.getFullYear(),
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

  console.log({ pagosDinamicos });

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
