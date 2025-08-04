"use server";
import { auth } from "@/auth.config";
import prisma from "@/lib/prisma";

export const cancelSubscription = async (): Promise<{
  ok: boolean;
  error?: string;
}> => {
  try {
    const session = await auth();
    const adminId = session?.user?.id;

    if (!adminId) {
      return { ok: false, error: "No autorizado." };
    }

    // 1. (Opcional) Llamar a la API de Mercado Pago para cancelar la pre-aprobación
    // Esto es crucial para que no se sigan generando cobros.
    // Necesitarías el ID de la pre-aprobación que se generó al crear la suscripción
    // const preApprovalId = "..."
    // const mpResponse = await mpApi.cancelPreApproval(preApprovalId);

    // 2. Actualizar el estado de la empresa en tu base de datos
    await prisma.empresa.updateMany({
      where: {
        administradores: {
          some: {
            id: adminId,
          },
        },
      },
      data: {
        estaActiva: false, // La empresa deja de estar activa
        estadoPago: "SUSPENDIDO_MANUALMENTE", // Se marca como suspendida manualmente
        // Aquí podrías agregar una fecha de cancelación si tuvieras el campo
      },
    });

    return { ok: true };
  } catch (error) {
    console.error("Error al cancelar la suscripción:", error);
    return {
      ok: false,
      error: "Error al cancelar la suscripción. Intenta de nuevo.",
    };
  }
};
