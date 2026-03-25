import { addMonths, setDate } from "date-fns";
import type { Pago } from "@prisma/client";

export interface MembershipInfo {
  inicio: Date | null;
  vencimiento: Date | null;
}

/**
 * Calcula las fechas de membresía del usuario
 *
 * La membresía vence el mismo DÍA de cada mes (ej: si empieza el 15, vence el 15/04, 15/05, 15/06...)
 *
 * @param fechaInicioMembresia - Fecha de inicio de membresía del usuario
 * @param pagos - Lista de pagos del usuario
 * @returns Información sobre las fechas de membresía
 */
export function getMembershipStatus(
  fechaInicioMembresia?: Date | string | null,
  pagos: Pago[] = [],
): MembershipInfo {
  if (!fechaInicioMembresia) {
    return { inicio: null, vencimiento: null };
  }

  const inicio = new Date(fechaInicioMembresia);
  const hoy = new Date();
  const diaCorte = inicio.getDate();

  // 1. Obtener mes/año actual
  const mesActual = hoy.getMonth() + 1;
  const añoActual = hoy.getFullYear();

  // 2. Buscar si ya pagó este mes
  const pagoEsteMes = pagos.find(
    (p) => p.mes === mesActual && p.año === añoActual && p.estado === "PAGADO",
  );

  let fechaBase = new Date(hoy);

  if (pagoEsteMes) {
    // 👉 Ya pagó → vencimiento es el mes siguiente
    fechaBase = addMonths(fechaBase, 1);
  }

  // 3. Construir fecha de vencimiento con el día fijo
  const vencimiento = setDate(fechaBase, diaCorte);

  return {
    inicio,
    vencimiento,
  };
}

/**
 * Formatea una fecha al formato dd/mm/yyyy
 * @param date - Fecha a formatear
 * @returns Fecha formateada como string
 */
export function formatDateLocal(date: Date): string {
  if (!date) return "";
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
