import { startOfDay, addDays, setDate, isAfter, endOfDay } from "date-fns";

// Zona horaria de referencia para la lógica de negocio
const TIMEZONE = "America/Argentina/Buenos_Aires";

/**
 * Obtiene la fecha y hora actual, normalizada al inicio del día (medianoche)
 * en la zona horaria de Argentina.
 */
export function getNormalizedBusinessDate(): Date {
  const now = new Date();
  const argentinaDateStr = now.toLocaleDateString("sv-SE", { timeZone: TIMEZONE });
  const [year, month, day] = argentinaDateStr.split("-").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Calcula la fecha de vencimiento mensual para la tarifa dinámica.
 */
export function calculateDynamicDueDate(
  fechaInicio: Date,
  fechaActual: Date
): Date {
  const startDay = fechaInicio.getDate();
  const result = new Date(fechaActual);
  result.setDate(startDay);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Calcula si un pago dinámico está vencido, considerando los días de gracia.
 */
export function isDynamicPaymentOverdue(
  fechaInicio: Date,
  diasGracia: number,
  fechaActual: Date
): boolean {
  const dueDate = calculateDynamicDueDate(fechaInicio, fechaActual);
  const gracePeriodEnd = endOfDay(addDays(dueDate, diasGracia));
  return fechaActual.getTime() > startOfDay(gracePeriodEnd).getTime();
}
