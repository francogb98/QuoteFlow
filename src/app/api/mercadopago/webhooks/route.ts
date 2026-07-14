export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { FrecuenciaPago, EstadoPagoMercadoPago } from "@prisma/client";
import { createCompanyAndAdmin } from "@/actions/auth/registration/03-createCompanyAndAdmin";
import { PreApproval, Payment } from "mercadopago";
import { MercadoPagoConfig } from "mercadopago";

const mpConfig = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseMercadoPagoDate(value: unknown): Date | undefined {
  if (!value) return undefined;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  return undefined;
}

function mapMercadoPagoStatusToEstadoPago(
  status: string | undefined,
): EstadoPagoMercadoPago | undefined {
  switch (status) {
    case "pending":
      return "PENDING";
    case "authorized":
    case "active":
      return "AUTHORIZED";
    case "cancelled":
      return "CANCELLED";
    case "expired":
    case "rejected":
      return "REJECTED";
    default:
      return undefined;
  }
}

function getPreapprovalDates(preapproval: any) {
  const fechaInicio = parseMercadoPagoDate(
    preapproval?.start_date || preapproval?.date_created,
  );
  const fechaFinPeriodoActual = parseMercadoPagoDate(
    preapproval?.next_payment_date,
  );
  const fechaUltimaModificacion = parseMercadoPagoDate(
    preapproval?.last_modified,
  );

  return {
    fechaInicio,
    fechaFinPeriodoActual,
    fechaUltimaModificacion,
    raw: {
      start_date: preapproval?.start_date,
      date_created: preapproval?.date_created,
      next_payment_date: preapproval?.next_payment_date,
      last_modified: preapproval?.last_modified,
    },
  };
}

async function fetchPreapprovalWithRetry(
  preapprovalClient: PreApproval,
  preapprovalId: string,
  options?: { retries?: number; delayMs?: number },
) {
  const retries = options?.retries ?? 3;
  const delayMs = options?.delayMs ?? 700;
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const preapproval = await preapprovalClient.get({ id: preapprovalId });

      const dates = getPreapprovalDates(preapproval);
      const hasRelevantDates =
        !!dates.fechaInicio || !!dates.fechaFinPeriodoActual;

      console.log("[webhook.preapproval.fetch]", {
        preapprovalId,
        attempt,
        status: preapproval?.status,
        hasRelevantDates,
        ...dates.raw,
      });

      if (hasRelevantDates || attempt === retries) {
        return preapproval;
      }
    } catch (error) {
      lastError = error;
      console.warn("[webhook.preapproval.fetch.error]", {
        preapprovalId,
        attempt,
        error,
      });
    }

    if (attempt < retries) {
      await sleep(delayMs);
    }
  }

  if (lastError) {
    throw lastError;
  }

  return null;
}

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
       IDEMPOTENCIA ’” verificar ANTES, registrar DESPUÑ‰S
       (registrar antes causaba que fallos silenciosos quedaran
       marcados como procesados y MP nunca reintentaba)
    ========================================================= */

    if (resourceId) {
      const existing = await prisma.webhookEvent.findUnique({
        where: { providerId: resourceId },
      });

      if (existing) {
        return NextResponse.json({ ok: true });
      }
    }

    switch (topic) {
      case "preapproval":
      case "subscription_preapproval":
        await handleSubscriptionEvent(body);
        break;
      case "authorized_payment":
      case "subscription_authorized_payment":
      case "payment": // MP a veces envía pagos de suscripción con topic genérico
        await handlePaymentEvent(body);
        break;
    }

    // Registrar el evento DESPUÑ‰S del procesamiento exitoso.
    // Si el procesamiento lanza error, el evento no se registra
    // y MP puede reintentar el webhook.
    if (resourceId) {
      await prisma.webhookEvent.create({
        data: {
          providerId: resourceId,
          topic,
          rawPayload: rawBody,
        },
      }).catch(() => {
        // Ignorar error de duplicado por concurrencia (unique constraint)
      });
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
    subscription = await fetchPreapprovalWithRetry(preapprovalClient, preapprovalId, {
      retries: 3,
      delayMs: 700,
    });
  } catch (error) {
    console.error(
      "[handleSubscriptionEvent] Error fetching preapproval:",
      error,
    );
    return;
  }

  if (!subscription) return;

  const status = subscription.status;
  const externalReference = subscription.external_reference;
  const mpDates = getPreapprovalDates(subscription);
  const mappedEstadoPago = mapMercadoPagoStatusToEstadoPago(status);

  console.log("[handleSubscriptionEvent] incoming", {
    preapprovalId,
    status,
    externalReference,
    ...mpDates.raw,
  });

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
     CASO 1 ’” REGISTRO NUEVO
  ========================================================= */
  if (type === "temp") {
    // createCompanyAndAdmin ya crea Empresa + Admin + SuscripcionEmpresa
    // Es idempotente: si ya existe, retorna el empresaId existente
    const result = await createCompanyAndAdmin(referenceId, preapprovalId);
    if (!result.ok || !result.empresaId) return;

    // Actualizar SuscripcionEmpresa con datos reales de MP
    const dataUpdate: any = {
      estadoSuscripcion: newStatus,
    };
    if (mappedEstadoPago) dataUpdate.estadoPagoMercadoPago = mappedEstadoPago;
    if (mpDates.fechaInicio) dataUpdate.fechaInicio = mpDates.fechaInicio;
    if (mpDates.fechaFinPeriodoActual) {
      dataUpdate.fechaFinPeriodoActual = mpDates.fechaFinPeriodoActual;
    }

    const updated = await prisma.suscripcionEmpresa.update({
      where: { empresaId: result.empresaId },
      data: dataUpdate,
      select: {
        id: true,
        empresaId: true,
        fechaInicio: true,
        fechaFinPeriodoActual: true,
        estadoSuscripcion: true,
      },
    });

    console.log("[handleSubscriptionEvent] update.after (temp)", updated);
    return;
  }

  /* =========================================================
     CASO 2 ’” EMPRESA EXISTENTE
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

    if (mappedEstadoPago) {
      dataUpdate.estadoPagoMercadoPago = mappedEstadoPago;
    }

    if (mpDates.fechaInicio) {
      dataUpdate.fechaInicio = mpDates.fechaInicio;
    }

    // Fuente canónica: Mercado Pago. Solo si no está disponible, usamos fallback local.
    if (mpDates.fechaFinPeriodoActual) {
      dataUpdate.fechaFinPeriodoActual = mpDates.fechaFinPeriodoActual;
    } else if (newStatus === "ACTIVA") {
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

    console.log("[handleSubscriptionEvent] update.before", {
      empresaId,
      preapprovalId,
      currentFechaInicio: existing.fechaInicio?.toISOString?.(),
      currentFechaFinPeriodoActual:
        existing.fechaFinPeriodoActual?.toISOString?.(),
      update: {
        ...dataUpdate,
        fechaInicio: dataUpdate.fechaInicio?.toISOString?.(),
        fechaFinPeriodoActual: dataUpdate.fechaFinPeriodoActual?.toISOString?.(),
      },
    });

    await prisma.$transaction([
      prisma.suscripcionEmpresa.update({
        where: { empresaId },
        data: dataUpdate,
      }),

      ...(newStatus === "ACTIVA" ? [] : []),
    ]);

    const updated = await prisma.suscripcionEmpresa.findUnique({
      where: { empresaId },
      select: {
        id: true,
        empresaId: true,
        fechaInicio: true,
        fechaFinPeriodoActual: true,
        estadoSuscripcion: true,
        estadoPagoMercadoPago: true,
      },
    });

    console.log("[handleSubscriptionEvent] update.after", updated);
  }
}

/* =========================================================
   HANDLE PAYMENT EVENT ’” FASE 1: REGISTRAR PAGOS
   ========================================================= */

async function handlePaymentEvent(body: any) {
  const paymentId = body.data?.id;
  if (!paymentId) return;

  // 1ï¸âƒ£ Intentar obtener el pago con manejo de reintentos
  const paymentClient = new Payment(mpConfig);
  let payment;

  try {
    payment = await paymentClient.get({ id: paymentId });
  } catch (error: any) {
    // âœ… CORRECCIÑ“N CRÑTICA:
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

  // 2ï¸âƒ£ Verificar estado aprobado
  if (payment.status !== "approved") {
    console.log(
      `[handlePaymentEvent] Payment ${paymentId} status: ${payment.status}. Ignored.`,
    );
    return;
  }

  const preapprovalId =
    (payment as any).preapproval_id || payment.metadata?.preapproval_id;

  // Buscar suscripción: primero por preapproval_id, luego por external_reference
  // como fallback para pagos donde preapproval_id no está expuesto por el SDK.
  let subscription = preapprovalId
    ? await prisma.suscripcionEmpresa.findUnique({
        where: { mercadoPagoPreApprovalId: String(preapprovalId) },
      })
    : null;

  if (!subscription) {
    const externalRef =
      (payment as any).external_reference ||
      payment.metadata?.external_reference;
    if (externalRef && String(externalRef).startsWith("empresa:")) {
      const empresaId = String(externalRef).split(":")[1];
      subscription = await prisma.suscripcionEmpresa.findUnique({
        where: { empresaId },
      });
    }
  }

  if (!subscription) {
    console.warn(
      `[handlePaymentEvent] No subscription found for payment ${paymentId} (preapprovalId=${preapprovalId})`,
    );
    return;
  }

  // 3ï¸âƒ£ Idempotencia: Verificar si ya registramos este pago
  const existingPayment = await prisma.pagoSuscripcionEmpresa.findUnique({
    where: { mercadoPagoPaymentId: String(paymentId) },
  });

  if (existingPayment) {
    console.log(`[handlePaymentEvent] Payment ${paymentId} already exists.`);
    return;
  }

  // 4ï¸âƒ£ Registrar el pago
  const preapprovalLookupId =
    String(preapprovalId || subscription.mercadoPagoPreApprovalId || "") || null;

  let syncedPreapproval: any = null;
  if (preapprovalLookupId) {
    try {
      const preapprovalClient = new PreApproval(mpConfig);
      syncedPreapproval = await fetchPreapprovalWithRetry(
        preapprovalClient,
        preapprovalLookupId,
        {
          retries: 3,
          delayMs: 700,
        },
      );
    } catch (error) {
      console.warn("[handlePaymentEvent] preapproval sync error", {
        preapprovalLookupId,
        error,
      });
    }
  }

  const preapprovalDates = getPreapprovalDates(syncedPreapproval);

  // 5ï¸âƒ£ Extender período y Activar
  const months = subscription.frecuenciaPago === FrecuenciaPago.ANUAL ? 12 : 1;
  const ahora = new Date();
  const baseDate =
    subscription.fechaFinPeriodoActual &&
    new Date(subscription.fechaFinPeriodoActual) > ahora
      ? new Date(subscription.fechaFinPeriodoActual)
      : ahora;

  const fallbackFechaFin = new Date(baseDate);
  fallbackFechaFin.setMonth(fallbackFechaFin.getMonth() + months);

  const dataUpdate: any = {
    estadoSuscripcion: "ACTIVA",
    estadoPagoMercadoPago: "AUTHORIZED",
    fechaFinPeriodoActual: preapprovalDates.fechaFinPeriodoActual || fallbackFechaFin,
  };

  if (preapprovalDates.fechaInicio) {
    dataUpdate.fechaInicio = preapprovalDates.fechaInicio;
  }

  console.log("[handlePaymentEvent] update.before", {
    paymentId,
    preapprovalId,
    preapprovalLookupId,
    currentFechaInicio: subscription.fechaInicio?.toISOString?.(),
    currentFechaFinPeriodoActual: subscription.fechaFinPeriodoActual?.toISOString?.(),
    mpDates: preapprovalDates.raw,
    update: {
      ...dataUpdate,
      fechaInicio: dataUpdate.fechaInicio?.toISOString?.(),
      fechaFinPeriodoActual: dataUpdate.fechaFinPeriodoActual?.toISOString?.(),
    },
    fechaFinSource: preapprovalDates.fechaFinPeriodoActual
      ? "mercado_pago"
      : "fallback_local",
  });

  await prisma.$transaction([
    prisma.pagoSuscripcionEmpresa.create({
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
    }),
    prisma.suscripcionEmpresa.update({
      where: { id: subscription.id },
      data: dataUpdate,
    }),
  ]);

  const updatedSubscription = await prisma.suscripcionEmpresa.findUnique({
    where: { id: subscription.id },
    select: {
      id: true,
      empresaId: true,
      fechaInicio: true,
      fechaFinPeriodoActual: true,
      estadoSuscripcion: true,
      estadoPagoMercadoPago: true,
    },
  });

  console.log(
    `[handlePaymentEvent] âœ… Success! Sub active until ${dataUpdate.fechaFinPeriodoActual}`,
  );
  console.log("[handlePaymentEvent] update.after", updatedSubscription);
}
