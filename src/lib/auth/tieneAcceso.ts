export type ResultadoAcceso = {
  tieneAcceso: boolean;
  motivo:
    | "SUPER_ADMIN"
    | "MANUAL_OVERRIDE"
    | "TRIAL_ACTIVO"
    | "ACTIVA"
    | "CANCELADA_CON_ACCESO"
    | "VENCIDA"
    | "SIN_SUSCRIPCION";
};

/**
 * Short-circuit helper — returns a ResultadoAcceso that grants unconditional access
 * for SUPER_ADMIN users without touching subscription data.
 */
export function tieneAccesoSuperAdmin(): ResultadoAcceso {
  return { tieneAcceso: true, motivo: "SUPER_ADMIN" };
}

export function tieneAccesoEmpresa(
  suscripcion: {
    estadoSuscripcion: string;
    fechaFinPeriodoActual: Date | string | null;
    manualOverrideEstado: string | null;
    manualOverrideHasta: Date | string | null;
  } | null,
): ResultadoAcceso {
  if (!suscripcion) {
    return { tieneAcceso: false, motivo: "SIN_SUSCRIPCION" };
  }

  const ahora = new Date();

  const fechaFin = suscripcion.fechaFinPeriodoActual
    ? new Date(suscripcion.fechaFinPeriodoActual)
    : null;

  const manualHasta = suscripcion.manualOverrideHasta
    ? new Date(suscripcion.manualOverrideHasta)
    : null;

  // Manual override
  if (suscripcion.manualOverrideEstado && manualHasta && manualHasta > ahora) {
    return { tieneAcceso: true, motivo: "MANUAL_OVERRIDE" };
  }

  if (suscripcion.estadoSuscripcion === "TRIAL") {
    if (!fechaFin || fechaFin > ahora) {
      return { tieneAcceso: true, motivo: "TRIAL_ACTIVO" };
    }
    return { tieneAcceso: false, motivo: "VENCIDA" };
  }

  if (suscripcion.estadoSuscripcion === "ACTIVA") {
    if (!fechaFin || fechaFin > ahora) {
      return { tieneAcceso: true, motivo: "ACTIVA" };
    }
    return { tieneAcceso: false, motivo: "VENCIDA" };
  }

  if (suscripcion.estadoSuscripcion === "CANCELADA") {
    if (fechaFin && fechaFin > ahora) {
      return { tieneAcceso: true, motivo: "CANCELADA_CON_ACCESO" };
    }
    return { tieneAcceso: false, motivo: "VENCIDA" };
  }

  return { tieneAcceso: false, motivo: "VENCIDA" };
}
