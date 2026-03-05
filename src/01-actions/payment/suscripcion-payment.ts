"use server";

import prisma from "@/lib/prisma";
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

export const handleSuscriber = async ({
  empresaId,
  adminEmail,
  transactionAmount,
  planName,
  frecuenciaPago,
  planTipo,
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
        external_reference: `empresa:${empresaId}`,
        back_url: `${baseUrl}/auth/success`,
        reason: `Suscripción ${planName}`,
        status: "pending",
      },
    });

    const preapprovalId = subscription.id;

    await prisma.suscripcionEmpresa.upsert({
      where: { empresaId },
      create: {
        empresaId,
        planTipo,
        frecuenciaPago,
        mercadoPagoPreApprovalId: preapprovalId,
        estadoSuscripcion: "PENDIENTE",
        estadoPagoMercadoPago: "PENDING",
      },
      update: {
        mercadoPagoPreApprovalId: preapprovalId,
        estadoSuscripcion: "PENDIENTE",
        estadoPagoMercadoPago: "PENDING",
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
