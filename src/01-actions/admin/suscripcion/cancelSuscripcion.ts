"use server";
import { auth } from "@/auth.config";
import prisma from "@/lib/prisma";
import { EstadoEmpresa } from "@prisma/client";

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

    // 1. Buscar la empresa y su preapproval id
    const empresa = await prisma.empresa.findFirst({
      where: {
        administradores: {
          some: { id: adminId },
        },
      },
      select: { id: true, mercadoPagoPreApprovalId: true },
    });

    // 2. Intentar cancelar en Mercado Pago si existe preapproval id
    if (empresa?.mercadoPagoPreApprovalId) {
      try {
        await fetch(
          `https://api.mercadopago.com/preapproval/${empresa.mercadoPagoPreApprovalId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
              "Content-Type": "application/json",
            },
          }
        );
      } catch (mpErr) {
        console.warn("No se pudo cancelar la preaprobación en MP:", mpErr);
      }
    }

    // 3. Actualizar el estado de la empresa en la BD
    await prisma.empresa.updateMany({
      where: {
        administradores: {
          some: {
            id: adminId,
          },
        },
      },
      data: {
        estaActiva: false,
        estadoPago: EstadoEmpresa.SUSPENDIDO_MANUALMENTE,
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
