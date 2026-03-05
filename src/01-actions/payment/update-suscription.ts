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
  const estaActiva = suscripcion.estadoSuscripcion === "ACTIVA";

  // ==========================================================
  // CASO 1: ACTIVA + MISMA FRECUENCIA → SOLO UPDATE
  // ==========================================================
  if (tienePreapproval && estaActiva && mismaFrecuencia) {
    console.log("entre aqui 0");
    await preApprovalClient.update({
      id: suscripcion.mercadoPagoPreApprovalId!,
      body: {
        auto_recurring: {
          transaction_amount: monto,
          currency_id: "ARS",
        },
        reason: `Suscripción ${planTipo}`,
      },
    });

    await prisma.suscripcionEmpresa.update({
      where: { empresaId },
      data: {
        planTipo,
      },
    });

    return {
      updated: true,
      message:
        "Plan actualizado. El nuevo importe se aplicará en el próximo ciclo.",
    };
  }

  // ==========================================================
  // CASO 2: EXISTE PERO NO ESTA ACTIVA → CREAR NUEVA
  // ==========================================================
  if (tienePreapproval && !estaActiva) {
    console.log("Creando nueva suscripción");

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

    console.log("MercadoPago response:", response);

    if (!response?.id || !response?.init_point) {
      throw new Error("No se pudo crear la suscripción");
    }

    await prisma.suscripcionEmpresa.update({
      where: { empresaId },
      data: {
        planTipo,
        frecuenciaPago,
        mercadoPagoPreApprovalId: response.id,
        estadoSuscripcion: "PENDIENTE",
      },
    });

    return {
      redirectUrl: response.init_point,
    };
  }

  // ==========================================================
  // CASO 3: CAMBIO DE FRECUENCIA → CANCELAR Y CREAR NUEVA
  // ==========================================================
  if (tienePreapproval && !mismaFrecuencia) {
    console.log("entre aqui 0");
    await preApprovalClient.update({
      id: suscripcion.mercadoPagoPreApprovalId!,
      body: {
        status: "cancelled",
      },
    });
  }

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

  if (!response?.id) {
    throw new Error("No se pudo crear la suscripción");
  }

  await prisma.suscripcionEmpresa.update({
    where: { empresaId },
    data: {
      planTipo,
      frecuenciaPago,
      mercadoPagoPreApprovalId: response.id,
      estadoSuscripcion: "PENDIENTE",
    },
  });

  return {
    redirectUrl: response.init_point,
  };
}
