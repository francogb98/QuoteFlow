"use server";

import { MercadoPagoConfig, PreApproval } from "mercadopago";
import { type TipoPlanEmpresa, FrecuenciaPago } from "@prisma/client";

const config = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

interface HandleSuscriberParams {
  empresaId: string;
  adminEmail: string; // Asumo que el documento es el "email" para MP, o debes pasar un email real
  transactionAmount: number;
  planName: string;
  frecuenciaPago: FrecuenciaPago;
  planTipo: TipoPlanEmpresa;
}

interface SuscriberResult {
  redirectUrl?: string;
  error?: string;
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
    const preApproval = new PreApproval(config);

    const mpFrequencyType =
      frecuenciaPago === FrecuenciaPago.MENSUAL ? "months" : "years";
    const mpFrequency = 1;

    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    const successUrl = `${baseUrl}/auth/success?preapproval_created=true&empresaId=${empresaId}&planType=${planTipo}&frequency=${frecuenciaPago}`;

    const newSuscriber = await preApproval.create({
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

    return { redirectUrl: newSuscriber.init_point };
  } catch (error) {
    console.error("Error al iniciar suscripción de Mercado Pago:", error);
    // Devolvemos el error en un formato amigable para el cliente
    return {
      error: "Error al procesar el pago. Por favor, inténtalo de nuevo.",
    };
  }
};
