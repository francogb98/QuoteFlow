"use server";

import { MercadoPagoConfig, PreApproval } from "mercadopago";
import { FrecuenciaPago, TipoPlanEmpresa } from "@prisma/client";
import prisma from "@/lib/prisma";

const config = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

function obtenerMonto(plan: TipoPlanEmpresa, frecuencia: FrecuenciaPago) {
  if (plan === "BASICO" && frecuencia === "MENSUAL") return 10000;
  if (plan === "BASICO" && frecuencia === "ANUAL") return 100000;
  if (plan === "PRO" && frecuencia === "MENSUAL") return 15000;
  if (plan === "PRO" && frecuencia === "ANUAL") return 150000;

  throw new Error("Combinación inválida");
}

export async function iniciarSuscripcionEmpresa({
  empresaId,
  adminEmail,
  planTipo,
  frecuenciaPago,
}: {
  empresaId: string;
  adminEmail: string;
  planTipo: TipoPlanEmpresa;
  frecuenciaPago: FrecuenciaPago;
}) {
  const suscripcion = await prisma.suscripcionEmpresa.findUnique({
    where: { empresaId },
  });

  if (!suscripcion) throw new Error("Suscripción no encontrada");

  const monto = obtenerMonto(planTipo, frecuenciaPago);
  const frequency = frecuenciaPago === "ANUAL" ? 12 : 1;

  const preApprovalClient = new PreApproval(config);

  const tienePreapproval = !!suscripcion.mercadoPagoPreApprovalId;
  const mismaFrecuencia = suscripcion.frecuenciaPago === frecuenciaPago;

  /* =========================================================
     SI EXISTE Y CAMBIAN FRECUENCIA → CANCELAMOS
  ========================================================= */

  if (tienePreapproval && !mismaFrecuencia) {
    await preApprovalClient.update({
      id: suscripcion.mercadoPagoPreApprovalId!,
      body: {
        status: "cancelled",
      },
    });
  }

  /* =========================================================
     CREAR NUEVA SUSCRIPCIÓN
  ========================================================= */

  const response: any = await preApprovalClient.create({
    body: {
      payer_email: adminEmail,
      auto_recurring: {
        frequency,
        frequency_type: "months",
        transaction_amount: monto,
        currency_id: "ARS",
      },
      external_reference: `empresa:${empresaId}`,
      back_url: `${process.env.FRONTEND_URL}/suscripcion/resultado`,
      reason: `Suscripción ${planTipo}`,
    },
  });

  if (!response?.id || !response?.init_point) {
    throw new Error("No se pudo crear la suscripción");
  }

  await prisma.suscripcionEmpresa.update({
    where: { empresaId },
    data: {
      mercadoPagoPreApprovalId: response.id,
    },
  });

  return {
    redirectUrl: response.init_point,
  };
}
