"use server";

import prisma from "@/lib/prisma";
import { PreApproval, MercadoPagoConfig } from "mercadopago";

const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

export async function syncSubscriptionAfterReturn(preapprovalId: string) {
  const client = new PreApproval(mp);

  const subscription = await client.get({ id: preapprovalId });

  if (!subscription) return;

  if (subscription.status !== "authorized" && subscription.status !== "active")
    return;

  const localSub = await prisma.suscripcionEmpresa.findUnique({
    where: { mercadoPagoPreApprovalId: preapprovalId },
  });

  if (!localSub) return;

  // El webhook es la fuente de verdad para fechas; aquí solo hacemos sync de estado.
  const requiresStatusSync =
    localSub.estadoSuscripcion !== "ACTIVA" ||
    localSub.estadoPagoMercadoPago !== "AUTHORIZED";

  if (!requiresStatusSync) {
    console.log("[syncSubscriptionAfterReturn] Already synced", {
      preapprovalId,
      suscripcionId: localSub.id,
    });
    return;
  }

  console.log("[syncSubscriptionAfterReturn] status.before", {
    preapprovalId,
    suscripcionId: localSub.id,
    estadoSuscripcion: localSub.estadoSuscripcion,
    estadoPagoMercadoPago: localSub.estadoPagoMercadoPago,
  });

  const updated = await prisma.suscripcionEmpresa.update({
    where: { id: localSub.id },
    data: {
      estadoSuscripcion: "ACTIVA",
      estadoPagoMercadoPago: "AUTHORIZED",
    },
    select: {
      id: true,
      estadoSuscripcion: true,
      estadoPagoMercadoPago: true,
      fechaInicio: true,
      fechaFinPeriodoActual: true,
    },
  });

  console.log("[syncSubscriptionAfterReturn] status.after", updated);
}
