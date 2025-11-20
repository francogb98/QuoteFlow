"use server";
import { handleSuscriber } from "@/01-actions/payment/suscripcion-payment";
import { auth } from "@/auth.config";
import { plans } from "@/lib/data/plansData";
import { FrecuenciaPago, TipoPlanEmpresa, EstadoEmpresa } from "@prisma/client";
import prisma from "@/lib/prisma";

interface UpdateSubscriptionParams {
  planId: string;
}

export const updateSubscription = async ({
  planId,
}: UpdateSubscriptionParams) => {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    const adminEmail = session?.user?.email;

    if (!adminId || !adminEmail) {
      return { ok: false, error: "No autorizado." };
    }

    const selectedPlan = plans.find((plan) => plan.id === planId);
    if (!selectedPlan) {
      return { ok: false, error: "Plan no válido." };
    }

    // Mapeo del ID del plan a los Enums de Prisma
    const [tipo, frecuencia] = selectedPlan.id.split("_");
    const planTipo = tipo.toUpperCase() as TipoPlanEmpresa;
    const frecuenciaPago = frecuencia.toUpperCase() as FrecuenciaPago;

    // Convertir el precio de string a número para Mercado Pago
    const transactionAmount = parseInt(
      selectedPlan.price.replace(/[^0-9]/g, "")
    );

    // Antes de crear la nueva suscripción, si había una preaprobación previa, la cancelamos
    try {
      const empresaActual = await prisma.empresa.findUnique({
        where: { id: session.user.empresaId! },
        select: { mercadoPagoPreApprovalId: true },
      });

      const existingPreapprovalId = empresaActual?.mercadoPagoPreApprovalId;
      if (existingPreapprovalId) {
        try {
          await fetch(
            `https://api.mercadopago.com/preapproval/${existingPreapprovalId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
              },
            }
          );
        } catch (mpCancelError) {
          console.warn(
            "No se pudo cancelar la preaprobación anterior en Mercado Pago:",
            mpCancelError
          );
        }
      }
    } catch (err) {
      console.warn(
        "No se pudo obtener empresa para cancelar preaprobación:",
        err
      );
    }

    // Llamamos a la función de Mercado Pago que ya tienes
    const result = await handleSuscriber({
      empresaId: session.user.empresaId!,
      adminEmail: adminEmail,
      transactionAmount,
      planName: selectedPlan.name,
      frecuenciaPago,
      planTipo,
    });

    // Si MP devolvió un preapprovalId, lo guardamos en la empresa
    try {
      if (result.preapprovalId) {
        await prisma.empresa.update({
          where: { id: session.user.empresaId! },
          data: {
            mercadoPagoPreApprovalId: result.preapprovalId,
            planTipo,
            frecuenciaPago,
            estadoPago: EstadoEmpresa.ACTIVO,
            estaActiva: true,
          },
        });
      } else {
        // Actualizar plan/frecuencia igualmente (en caso de que quieras reflejar el cambio inmediatamente)
        await prisma.empresa.update({
          where: { id: session.user.empresaId! },
          data: {
            planTipo,
            frecuenciaPago,
            estaActiva: true,
          },
        });
      }
    } catch (dbErr) {
      console.error(
        "Error al actualizar la empresa con la preaprobación:",
        dbErr
      );
    }

    return {
      ok: true,
      redirectUrl: result.redirectUrl,
    };
  } catch (error) {
    console.error("Error al actualizar la suscripción:", error);
    return { ok: false, error: "Error al procesar la actualización del plan." };
  }
};
