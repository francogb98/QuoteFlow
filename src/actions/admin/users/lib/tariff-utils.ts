import { TipoConfiguracionTarifa } from "@prisma/client";

// Función para calcular el monto de pago dinámico
export function calculateDynamicPaymentAmount(
  configuracionTarifa: any,
  fechaVencimiento: Date,
  fechaActual: Date = new Date()
): number {
  if (
    configuracionTarifa.tipoConfiguracion !==
    TipoConfiguracionTarifa.DINAMICA_POR_FECHA_INGRESO
  ) {
    throw new Error("Esta función solo es para configuración dinámica");
  }

  const diasVencido = Math.floor(
    (fechaActual.getTime() - fechaVencimiento.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diasVencido <= configuracionTarifa.diasGracia) {
    return configuracionTarifa.montoBase;
  } else {
    return configuracionTarifa.montoRecargo;
  }
}

// Función para calcular la próxima fecha de vencimiento en sistema dinámico
export function calculateNextDynamicPaymentDate(
  fechaInicioMembresia: Date,
  mesesAgregar = 1
): Date {
  const nextDate = new Date(fechaInicioMembresia);
  nextDate.setMonth(nextDate.getMonth() + mesesAgregar);
  return nextDate;
}

// Función para obtener el rango de tarifa apropiado en sistema fijo mensual
export function getApplicableTariffRange(rangos: any[], diaDelMes: number) {
  if (!rangos || rangos.length === 0) {
    throw new Error("No hay rangos de tarifas configurados");
  }

  // Buscar el rango que incluye el día especificado
  const rangoAplicable = rangos.find(
    (rango) => diaDelMes >= rango.diaInicio && diaDelMes <= rango.diaFin
  );

  // Si no se encuentra un rango específico, usar el primer rango como fallback
  return rangoAplicable || rangos.sort((a, b) => a.diaInicio - b.diaInicio)[0];
}

// Función para validar configuración de tarifa
export function validateTariffConfiguration(configuracionTarifa: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!configuracionTarifa) {
    errors.push("No hay configuración de tarifas");
    return { isValid: false, errors };
  }

  if (
    configuracionTarifa.tipoConfiguracion ===
    TipoConfiguracionTarifa.FIJA_MENSUAL
  ) {
    if (
      !configuracionTarifa.rangos ||
      configuracionTarifa.rangos.length === 0
    ) {
      errors.push(
        "No hay rangos de tarifas configurados para el sistema fijo mensual"
      );
    }
  } else if (
    configuracionTarifa.tipoConfiguracion ===
    TipoConfiguracionTarifa.DINAMICA_POR_FECHA_INGRESO
  ) {
    if (!configuracionTarifa.montoBase) {
      errors.push("Falta el monto base para el sistema dinámico");
    }
    if (
      configuracionTarifa.diasGracia === null ||
      configuracionTarifa.diasGracia === undefined
    ) {
      errors.push("Faltan los días de gracia para el sistema dinámico");
    }
    if (!configuracionTarifa.montoRecargo) {
      errors.push("Falta el monto de recargo para el sistema dinámico");
    }
  } else {
    errors.push("Tipo de configuración de tarifa no válido");
  }

  return { isValid: errors.length === 0, errors };
}
