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

    // Determina el tipo de frecuencia para Mercado Pago
    const mpFrequencyType =
      frecuenciaPago === FrecuenciaPago.MENSUAL ? "months" : "years";
    const mpFrequency = 1; // Siempre 1 unidad del tipo de frecuencia

    // Asegúrate de tener NEXT_PUBLIC_BASE_URL configurado en tus variables de entorno.
    // En Vercel, `NEXT_PUBLIC_VERCEL_URL` es una buena opción si estás en Vercel.
    const baseUrl =
      process.env.NEXT_PUBLIC_VERCEL_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "http://localhost:3000";
    const successUrl = `${baseUrl}/auth/success?preapproval_created=true&empresaId=${empresaId}&planType=${planTipo}&frequency=${frecuenciaPago}`;

    const newSuscriber = await preApproval.create({
      body: {
        payer_email: adminEmail,
        auto_recurring: {
          frequency: mpFrequency,
          frequency_type: mpFrequencyType,
          transaction_amount: 1500,
          currency_id: "ARS",
        },
        // Usamos external_reference para guardar nuestro ID de empresa
        // Esto es útil para los webhooks, aunque la back_url también lo pasa.
        external_reference: empresaId,
        back_url: successUrl,
        reason: `Suscripción ${planName}`,
        status: "pending", // El estado inicial de la pre-aprobación
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
