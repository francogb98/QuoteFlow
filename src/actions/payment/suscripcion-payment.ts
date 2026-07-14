"use server";

import { MercadoPagoConfig, PreApproval } from "mercadopago";
import { TipoPlanEmpresa, FrecuenciaPago } from "@prisma/client";

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

/**
 * Creates a Mercado Pago PreApproval for a new registration.
 * NOTE: empresaId is the TempRegistration ID for new registrations.
 * The actual Empresa + SuscripcionEmpresa are created later via
 * createCompanyAndAdmin() after payment is confirmed.
 */
export const handleSuscriber = async ({
  empresaId,
  adminEmail,
  transactionAmount,
  planName,
  frecuenciaPago,
  planTipo: _planTipo,
}: HandleSuscriberParams) => {
  try {
    const preApproval = new PreApproval(config);

    const frequency = frecuenciaPago === "ANUAL" ? 12 : 1;

    const baseUrl = process.env.FRONTEND_URL!;

    const subscription = await preApproval.create({
      body: {
        payer_email: adminEmail,
        auto_recurring: {
          frequency,
          frequency_type: "months",
          transaction_amount: transactionAmount,
          currency_id: "ARS",
        },
        // Usamos prefijo "temp:" para que el webhook CASE 1 procese el registro nuevo
        external_reference: `temp:${empresaId}`,
        back_url: `${baseUrl}/auth/success`,
        reason: `Suscripción ${planName}`,
        status: "pending",
      },
    });

    return {
      redirectUrl: subscription.init_point,
    };
  } catch (error) {
    console.error(error);
    return { error: "Error creando suscripción" };
  }
};
