"use server";

import { MercadoPagoConfig, PreApproval } from "mercadopago";
import { type TipoPlanEmpresa, FrecuenciaPago } from "@prisma/client";

const config = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

interface HandleSuscriberParams {
  empresaId: string;
  adminEmail: string;
  transactionAmount: number;
  planName: string;
  frecuenciaPago: FrecuenciaPago;
  planTipo: TipoPlanEmpresa;
}

interface SuscriberResult {
  redirectUrl?: string;
  error?: string;
  preapprovalId?: string;
}

export const handleSuscriber = async ({
  empresaId,
  transactionAmount,
  planName,
  frecuenciaPago,
  planTipo,
  adminEmail,
}: HandleSuscriberParams): Promise<SuscriberResult> => {
  try {
    if (
      !empresaId ||
      !adminEmail ||
      !transactionAmount ||
      transactionAmount <= 0
    ) {
      throw new Error("Parámetros inválidos para la suscripción");
    }

    const preApproval = new PreApproval(config);

    // Mercado Pago acepta 'days' o 'months' como frequency_type.
    // Para suscripciones anuales usemos 'months' con frequency = 12.
    let mpFrequencyType: "days" | "months" = "months";
    let mpFrequency = 1;
    if (frecuenciaPago === FrecuenciaPago.MENSUAL) {
      mpFrequencyType = "months";
      mpFrequency = 1;
    } else if (frecuenciaPago === FrecuenciaPago.ANUAL) {
      mpFrequencyType = "months";
      mpFrequency = 12;
    } else {
      // fallback a mensual
      mpFrequencyType = "months";
      mpFrequency = 1;
    }

    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    const successUrl = `${baseUrl}/auth/success?preapproval_created=true&empresaId=${empresaId}&planType=${planTipo}&frequency=${frecuenciaPago}`;

    const newSuscriber: any = await preApproval.create({
      body: {
        payer_email: adminEmail,
        auto_recurring: {
          frequency: mpFrequency,
          frequency_type: mpFrequencyType,
          transaction_amount: transactionAmount,
          currency_id: "ARS",
        },
        external_reference: empresaId,
        back_url: successUrl,
        reason: `Suscripción ${planName}`,
        status: "pending",
      },
    });

    // Intentamos obtener un id de preaprobación si viene en la respuesta
    const preapprovalId =
      newSuscriber.id ||
      newSuscriber.preapproval_id ||
      newSuscriber?.response?.id;

    return {
      redirectUrl: newSuscriber.init_point,
      ...(preapprovalId ? { preapprovalId } : {}),
    } as any;
  } catch (error) {
    console.error("Error al iniciar suscripción de Mercado Pago:", error);
    return {
      error: "Error al procesar el pago. Por favor, inténtalo de nuevo.",
    };
  }
};
