"use server";
import { handleSuscriber } from "@/01-actions/payment/suscripcion.payment";
import { auth } from "@/auth.config";
import { plans } from "@/lib/data/plansData";
import { FrecuenciaPago, TipoPlanEmpresa } from "@prisma/client";

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

    // Llamamos a la función de Mercado Pago que ya tienes
    const result = await handleSuscriber({
      empresaId: session.user.empresaId!,
      adminEmail: adminEmail,
      transactionAmount,
      planName: selectedPlan.name,
      frecuenciaPago,
      planTipo,
    });

    return {
      ok: true,
      redirectUrl: result.redirectUrl,
    };
  } catch (error) {
    console.error("Error al actualizar la suscripción:", error);
    return { ok: false, error: "Error al procesar la actualización del plan." };
  }
};
