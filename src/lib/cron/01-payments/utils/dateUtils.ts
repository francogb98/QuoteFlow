import moment from "moment-timezone";
import { startOfDay } from "date-fns";

// Zona horaria de referencia para la lógica de negocio
const TIMEZONE = "America/Argentina/Buenos_Aires";

/**
 * Obtiene la fecha y hora actual, normalizada al inicio del día (medianoche) en la zona horaria de Argentina.
 * Esta debe ser la "Fecha de Negocio" para todos los procesos diarios.
 * @returns {Date} La fecha actual a las 00:00:00.000 de Argentina.
 */
export function getNormalizedBusinessDate(): Date {
  return moment().tz(TIMEZONE).startOf("day").toDate();
}

/**
 * Calcula la fecha de vencimiento mensual para la tarifa dinámica,
 * basándose en la fecha de inicio de membresía del usuario.
 * @param {Date} fechaInicio - La fecha de inicio de membresía del usuario.
 * @param {Date} fechaActual - La fecha de negocio normalizada (hoy).
 * @returns {Date} La fecha de vencimiento del pago para el fechaActual.
 */
export function calculateDynamicDueDate(
  fechaInicio: Date,
  fechaActual: Date
): Date {
  const startDay = fechaInicio.getDate();
  const todayMoment = moment(fechaActual).tz(TIMEZONE);

  // 1. Calcular la fecha de vencimiento en el mes actual, usando el día de inicio.
  let dueDateMoment = todayMoment.clone().date(startDay).startOf("day");

  // 2. Si el día del mes de inicio (startDay) es mayor al último día del mes actual,
  // moment ajustará esto automáticamente (ej: 31 de Febrero -> 28 de Febrero).

  // 3. Si la fecha de vencimiento calculada es anterior a la fecha actual,
  // significa que ya venció en el mes pasado. En este cron, solo nos importa el pago que vence ESTE mes.
  // Sin embargo, para la lógica de vencimiento y notificaciones, queremos el pago PENDIENTE.
  // Simplificamos: La fecha de vencimiento es el día de inicio del mes actual.

  return dueDateMoment.toDate();
}

/**
 * Calcula si un pago dinámico está vencido, considerando los días de gracia.
 * @param {Date} fechaInicio - La fecha de inicio de membresía del usuario.
 * @param {number} diasGracia - Días de gracia.
 * @param {Date} fechaActual - La fecha de negocio normalizada (hoy).
 * @returns {boolean} True si el pago está vencido.
 */
export function isDynamicPaymentOverdue(
  fechaInicio: Date,
  diasGracia: number,
  fechaActual: Date
): boolean {
  // 1. Obtener la fecha de vencimiento sin gracia (día de inicio de membresía de este mes)
  const dueDate = calculateDynamicDueDate(fechaInicio, fechaActual);

  // 2. Calcular la fecha límite de pago (vencimiento + días de gracia)
  const gracePeriodEnd = moment(dueDate)
    .add(diasGracia, "days")
    .endOf("day")
    .toDate();

  // 3. Comparar la fecha límite con la fecha actual (medianoche de hoy)
  return fechaActual.getTime() > startOfDay(gracePeriodEnd).getTime();
}
