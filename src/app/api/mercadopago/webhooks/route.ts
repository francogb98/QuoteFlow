export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { FrecuenciaPago, EstadoPagoMercadoPago } from "@prisma/client";
import { createCompanyAndAdmin } from "@/01-actions/auth/registration/03-createCompanyAndAdmin";
import { PreApproval, Payment } from "mercadopago";
import { MercadoPagoConfig } from "mercadopago";

const mpConfig = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

/* =========================================================
   POST WEBHOOK
========================================================= */

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    const requestId = request.headers.get("x-request-id");
    const xSignature = request.headers.get("x-signature");

    if (!requestId || !xSignature) {
      return NextResponse.json(
        { error: "Missing signature headers" },
        { status: 400 },
      );
    }

    const isValid = validateWebhookSignature(rawBody, xSignature, requestId);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const topic = body.type || body.topic;
    const resourceId = body.data?.id;

    /* =========================================================
       IDEMPOTENCIA
    ========================================================= */

    if (resourceId) {
      const existing = await prisma.webhookEvent.findUnique({
        where: { providerId: resourceId },
      });

      if (existing) {
        return NextResponse.json({ ok: true });
      }

      await prisma.webhookEvent.create({
        data: {
          providerId: resourceId,
          topic,
          rawPayload: rawBody,
        },
      });
    }

    switch (topic) {
      case "preapproval":
      case "subscription_preapproval":
        await handleSubscriptionEvent(body);
        break;
      case "authorized_payment":
      case "subscription_authorized_payment":
        await handlePaymentEvent(body);
        break;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("WEBHOOK ERROR:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function validateWebhookSignature(
  rawBody: string,
  xSignature: string,
  requestId: string,
): boolean {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (!secret) return false;

  try {
    const parts = xSignature.split(",");
    const ts = parts.find((p) => p.startsWith("ts="))?.split("=")[1];
    const v1 = parts.find((p) => p.startsWith("v1="))?.split("=")[1];

    if (!ts || !v1) return false;

    const body = JSON.parse(rawBody);
    const dataId = body.data?.id;
    if (!dataId) return false;

    const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;

    const expectedHash = crypto
      .createHmac("sha256", secret)
      .update(manifest)
      .digest("hex");

    return expectedHash === v1;
  } catch {
    return false;
  }
}

async function handleSubscriptionEvent(body: any) {
  const preapprovalId = body.data?.id;
  if (!preapprovalId) return;

  const preapprovalClient = new PreApproval(mpConfig);

  let subscription;
  try {
    subscription = await preapprovalClient.get({ id: preapprovalId });
  } catch (error) {
    console.error(
      "[handleSubscriptionEvent] Error fetching preapproval:",
      error,
    );
    return;
  }

  const status = subscription.status;
  const externalReference = subscription.external_reference;

  if (!status || !externalReference) return;

  const statusMap = {
    pending: { internal: "PENDIENTE" },
    authorized: { internal: "ACTIVA" }, // ¡Importante! Authorized = Activa
    active: { internal: "ACTIVA" },
    cancelled: { internal: "CANCELADA" },
    expired: { internal: "VENCIDA" },
    rejected: { internal: "PENDIENTE" }, // Si rechazan, sigue pendiente de pago
  } as const;

  if (!(status in statusMap)) return;

  const newStatus = statusMap[status as keyof typeof statusMap].internal;

  const [type, referenceId] = externalReference.split(":");

  /* =========================================================
     CASO 1 — REGISTRO NUEVO
  ========================================================= */
  if (type === "temp") {
    const result = await createCompanyAndAdmin(referenceId, preapprovalId);
    if (!result.ok || !result.empresaId) return;

    const temp = await prisma.tempRegistration.findUnique({
      where: { id: referenceId },
    });
    if (!temp) return;

    const months = temp.frecuenciaPago === FrecuenciaPago.ANUAL ? 12 : 1;
    const fechaFin = new Date();
    fechaFin.setMonth(fechaFin.getMonth() + months);

    await prisma.suscripcionEmpresa.create({
      data: {
        empresaId: result.empresaId,
        planTipo: temp.planTipo,
        frecuenciaPago: temp.frecuenciaPago,
        mercadoPagoPreApprovalId: preapprovalId,
        estadoSuscripcion: newStatus,
        fechaInicio: new Date(),
        fechaFinPeriodoActual: fechaFin,
      },
    });
    return;
  }

  /* =========================================================
     CASO 2 — EMPRESA EXISTENTE
  ========================================================= */
  if (type === "empresa") {
    const empresaId = referenceId;
    const existing = await prisma.suscripcionEmpresa.findUnique({
      where: { empresaId },
    });

    if (!existing) return;

    // Si el estado cambió a ACTIVA, calculamos la fecha fin
    // Nota: Esto es un respaldo. handlePaymentEvent es más preciso con las fechas.
    // Pero si el pago se aprueba y este webhook llega primero, mejor activamos aquí.

    const dataUpdate: any = {
      estadoSuscripcion: newStatus,
    };

    // Si se activa, extendemos la fecha desde hoy (o desde la fecha fin actual si existe)
    if (newStatus === "ACTIVA") {
      const months = existing.frecuenciaPago === FrecuenciaPago.ANUAL ? 12 : 1;
      const baseDate =
        existing.fechaFinPeriodoActual &&
        new Date(existing.fechaFinPeriodoActual) > new Date()
          ? new Date(existing.fechaFinPeriodoActual)
          : new Date();

      const nuevaFechaFin = new Date(baseDate);
      nuevaFechaFin.setMonth(nuevaFechaFin.getMonth() + months);

      dataUpdate.fechaFinPeriodoActual = nuevaFechaFin;
    }

    await prisma.suscripcionEmpresa.update({
      where: { empresaId },
      data: dataUpdate,
    });
  }
}

/* =========================================================
   HANDLE PAYMENT EVENT — FASE 1: REGISTRAR PAGOS
   ========================================================= */

async function handlePaymentEvent(body: any) {
  const paymentId = body.data?.id;
  if (!paymentId) return;

  // 1️⃣ Intentar obtener el pago con manejo de reintentos
  const paymentClient = new Payment(mpConfig);
  let payment;

  try {
    payment = await paymentClient.get({ id: paymentId });
  } catch (error: any) {
    // ✅ CORRECCIÓN CRÍTICA:
    // Si MP devuelve 404, significa que el pago aún no está indexado en su API pública.
    // Lanzamos un error para que la función POST principal retorne 500.
    // Mercado Pago verá el error 500 y reenviará el webhook en unos minutos.
    if (error?.status === 404 || error?.error === "not_found") {
      console.warn(
        `[handlePaymentEvent] Payment ${paymentId} not found yet (latency). Requesting retry.`,
      );
      throw new Error("Payment not found in API, retry later");
    }

    console.error("[handlePaymentEvent] Error fetching payment:", error);
    return;
  }

  if (!payment) return;

  // 2️⃣ Verificar estado aprobado
  if (payment.status !== "approved") {
    console.log(
      `[handlePaymentEvent] Payment ${paymentId} status: ${payment.status}. Ignored.`,
    );
    return;
  }

  const preapprovalId =
    (payment as any).preapproval_id || payment.metadata?.preapproval_id;
  if (!preapprovalId) return;

  const subscription = await prisma.suscripcionEmpresa.findUnique({
    where: { mercadoPagoPreApprovalId: String(preapprovalId) },
  });

  if (!subscription) return;

  // 3️⃣ Idempotencia: Verificar si ya registramos este pago
  const existingPayment = await prisma.pagoSuscripcionEmpresa.findUnique({
    where: { mercadoPagoPaymentId: String(paymentId) },
  });

  if (existingPayment) {
    console.log(`[handlePaymentEvent] Payment ${paymentId} already exists.`);
    return;
  }

  // 4️⃣ Registrar el pago
  await prisma.pagoSuscripcionEmpresa.create({
    data: {
      empresaId: subscription.empresaId,
      suscripcionId: subscription.id,
      mercadoPagoPaymentId: String(paymentId),
      mercadoPagoPreApprovalId: preapprovalId,
      monto: payment.transaction_amount || 0,
      estadoMercadoPago: "AUTHORIZED",
      fechaPago: payment.date_approved
        ? new Date(payment.date_approved)
        : new Date(),
      rawPayload: JSON.stringify(payment),
    },
  });

  // 5️⃣ Extender período y Activar
  const months = subscription.frecuenciaPago === FrecuenciaPago.ANUAL ? 12 : 1;
  const ahora = new Date();
  const baseDate =
    subscription.fechaFinPeriodoActual &&
    new Date(subscription.fechaFinPeriodoActual) > ahora
      ? new Date(subscription.fechaFinPeriodoActual)
      : ahora;

  const nuevaFechaFin = new Date(baseDate);
  nuevaFechaFin.setMonth(nuevaFechaFin.getMonth() + months);

  await prisma.suscripcionEmpresa.update({
    where: { id: subscription.id },
    data: {
      estadoSuscripcion: "ACTIVA",
      estadoPagoMercadoPago: "AUTHORIZED",
      fechaFinPeriodoActual: nuevaFechaFin,
    },
  });

  console.log(
    `[handlePaymentEvent] ✅ Success! Sub active until ${nuevaFechaFin}`,
  );
}
