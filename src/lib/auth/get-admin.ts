import prisma from "@/lib/prisma";

/**
 * Función para obtener datos del administrador sin ser server action
 * Usada en callbacks de NextAuth donde no se pueden usar server actions
 */
export async function getAdminForAuth(id: string) {
  try {
    const admin = await prisma.administrador.findUnique({
      where: { id },
      include: {
        empresa: {
          include: {
            suscripcion: {
              select: {
                estadoSuscripcion: true,
                fechaFinPeriodoActual: true,
                manualOverrideEstado: true,
                manualOverrideHasta: true,
                // AGREGA ESTOS CAMPOS:
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
          include: {
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
      return null;
    }

    // No retornar la contraseña
    const { password, ...adminSinPassword } = admin;

    return adminSinPassword;
  } catch (error) {
    console.error("Error al obtener administrador:", error);
    return null;
  }
}
