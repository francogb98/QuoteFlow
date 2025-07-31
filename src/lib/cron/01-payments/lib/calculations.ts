export interface PaymentCalculation {
  fechaVencimiento: Date;
  monto: number;
  periodo: string;
}

/** * Calcula la fecha de vencimiento y monto para un usuario con configuración dinámica */
export function calculateDynamicPayment(
  fechaIngreso: Date,
  configuracion: {
    montoBase: number;
    diasGracia: number;
  }
): PaymentCalculation {
  const fechaVencimiento = new Date(fechaIngreso);
  fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);
  if (fechaVencimiento.getDate() !== fechaIngreso.getDate()) {
    fechaVencimiento.setDate(0);
  }
  const periodo = `${fechaVencimiento.getFullYear()}-${String(
    fechaVencimiento.getMonth() + 1
  ).padStart(2, "0")}`;
  return {
    fechaVencimiento,
    monto: configuracion.montoBase,
    periodo,
  };
}

/** * Calcula la próxima fecha de vencimiento basada en el primer pago */
export function calculateNextPaymentDate(primerPago: any): Date {
  const fechaBase = new Date(primerPago.fechaVencimiento || primerPago.fecha);
  const proximaFecha = new Date(fechaBase);
  proximaFecha.setMonth(proximaFecha.getMonth() + 1);
  if (proximaFecha.getDate() !== fechaBase.getDate()) {
    proximaFecha.setDate(0);
  }
  return proximaFecha;
}

/** * Verifica si un pago está vencido considerando los días de gracia */
export function isPaymentOverdue(
  fechaVencimiento: Date,
  diasGracia: number,
  fechaActual: Date = new Date()
): boolean {
  const fechaLimite = new Date(fechaVencimiento);
  fechaLimite.setDate(fechaLimite.getDate() + diasGracia);
  return fechaActual > fechaLimite;
}

/** * Encuentra el rango de tarifa para una fecha específica */
export function findTarifaRangeForDate(rangos: any[], fecha: Date) {
  const diaDelMes = fecha.getDate();
  const rangoActual = rangos.find((rango) => {
    return diaDelMes >= rango.diaInicio && diaDelMes <= rango.diaFin;
  });
  return rangoActual;
}

/** * Calcula los días transcurridos desde el vencimiento */
export function calculateDaysOverdue(
  fechaVencimiento: Date,
  fechaActual: Date = new Date()
): number {
  return Math.floor(
    (fechaActual.getTime() - fechaVencimiento.getTime()) / (1000 * 60 * 60 * 24)
  );
}
