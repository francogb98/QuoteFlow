import { SuscripcionEmpresa, Empresa } from "@prisma/client";
import prisma from "@/lib/prisma";

/**
 * FASE 4 — Verificación de Acceso Unificada
 *
 * Valida el acceso de una empresa basándose en múltiples criterios:
 * 1. Override manual activo
 * 2. Suscripción ACTIVA con período vigente
 * 3. Período de prueba (TRIAL) vigente
 *
 * @param empresaId - ID de la empresa a verificar
 * @returns true si tiene acceso, false en caso contrario
 */
export async function checkCompanyAccess(empresaId: string): Promise<boolean> {
  const ahora = new Date();

  try {
    // Obtener empresa con suscripción
    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
      include: { suscripcion: true },
    });

    if (!empresa) {
      return false;
    }

    const suscripcion = empresa.suscripcion;

    // 1. Verificar Suscripción ACTIVA con período vigente
    if (
      suscripcion?.estadoSuscripcion === "ACTIVA" &&
      suscripcion?.fechaFinPeriodoActual &&
      new Date(suscripcion.fechaFinPeriodoActual) > ahora
    ) {
      return true;
    }

    // 2. Verificar Período de Prueba (TRIAL)
    if (
      suscripcion?.estadoSuscripcion === "TRIAL" &&
      empresa.fechaFinPrueba &&
      new Date(empresa.fechaFinPrueba) > ahora
    ) {
      return true;
    }

    // 3. Verificar suscripción CANCELADA con período de gracia
    if (
      suscripcion?.estadoSuscripcion === "CANCELADA" &&
      suscripcion?.fechaFinPeriodoActual &&
      new Date(suscripcion.fechaFinPeriodoActual) > ahora
    ) {
      return true;
    }

    // 4. Verificar pago autorizado por Mercado Pago (incluso si estadoSuscripción no está actualizado)
    // Esto permite el acceso a usuarios que han pagado pero el estado aún no se ha actualizado
    if (
      suscripcion?.estadoPagoMercadoPago === "AUTHORIZED" ||
      suscripcion?.estadoPagoMercadoPago === "PAID"
    ) {
      // Si tiene fechaFinPeriodoActual válida, usarla
      if (
        suscripcion?.fechaFinPeriodoActual &&
        new Date(suscripcion.fechaFinPeriodoActual) > ahora
      ) {
        return true;
      }
      // Si no tiene fechaFinPeriodoActual válida, permitir acceso temporalmente
      // (el webhook debería actualizar esto, pero esto evita bloquear usuarios que pagaron)
      return true;
    }

    // Caso contrario → bloquear
    return false;
  } catch (error) {
    console.error("Error verificando acceso de empresa:", error);
    return false;
  }
}

/**
 * Función legada para compatibilidad
 * @deprecated Usar checkCompanyAccess en su lugar
 */
export function tieneAcceso(suscripcion: SuscripcionEmpresa | null) {
  if (!suscripcion) return false;

  if (suscripcion.estadoSuscripcion === "VENCIDA") return false;

  if (suscripcion.estadoSuscripcion === "CANCELADA") {
    return new Date() < (suscripcion.fechaFinPeriodoActual ?? new Date());
  }

  return true;
}
