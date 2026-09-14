import prisma from "@/lib/prisma";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdminResult = Record<string, any> | null;

interface CacheEntry {
  data: AdminResult;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

/**
 * Función para obtener datos del administrador sin ser server action.
 * Usada en callbacks de NextAuth donde no se pueden usar server actions.
 * Incluye caché de 5 min para evitar consultas repetidas a DB por cada request.
 */
export async function getAdminForAuth(id: string): Promise<AdminResult> {
  const now = Date.now();
  const cached = cache.get(id);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  try {
    const admin = await prisma.administrador.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        documento: true,
        email: true,
        telefono: true,
        rol: true,
        estaActivo: true,
        fechaCreacion: true,
        fechaActualizacion: true,
        empresaId: true,
        claveMercadoPago: true,
        tokenMercadoPagoExpiresAt: true,
        mercadoPagoRefreshToken: true,
        configuracionTarifaId: true,
        modeloDeCobro: true,
        recibirNotificacionesPago: true,
        recibirNotificacionesComprobante: true,
        emailNotificaciones: true,
        permitirModificarTarifa: true,
        permitirModificarCobro: true,
        onboardingCompletado: true,
        empresa: {
          select: {
            id: true,
            nombre: true,
            contactEmail: true,
            fechaCreacion: true,
            fechaActualizacion: true,
            planTipo: true,
            mercadoPagoPreApprovalId: true,
            estadoPago: true,
            frecuenciaPago: true,
            fechaUltimoPago: true,
            fechaProximoVencimiento: true,
            estaActiva: true,
            esCuentaPrueba: true,
            codigoPromocionalId: true,
            fechaFinPrueba: true,
            suscripcion: {
              select: {
                estadoSuscripcion: true,
                estadoPagoMercadoPago: true,
                fechaFinPeriodoActual: true,
                manualOverrideEstado: true,
                manualOverrideHasta: true,
                planTipo: true,
                frecuenciaPago: true,
              },
            },
          },
        },
        usuarios: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            documento: true,
            estado: true,
            estaActivo: true,
          },
        },
        configuracionTarifa: {
          select: {
            id: true,
            tipoConfiguracion: true,
            fechaCreacion: true,
            estaActiva: true,
            rangos: true,
            dinamicas: true,
          },
        },
        notificacionesRecibidas: {
          take: 8,
          orderBy: [{ leida: "asc" }, { fechaCreacion: "desc" }],
        },
      },
    });

    if (!admin) {
      cache.set(id, { data: null, expiresAt: now + CACHE_TTL_MS });
      return null;
    }

    cache.set(id, { data: admin, expiresAt: now + CACHE_TTL_MS });
    return admin;
  } catch (error) {
    console.error("Error al obtener administrador:", error);
    return null;
  }
}

/**
 * Invalidar caché de un admin (ej: después de actualizar datos).
 */
export function invalidateAdminCache(id: string) {
  cache.delete(id);
}
