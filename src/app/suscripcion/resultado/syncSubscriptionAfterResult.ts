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

  await prisma.$transaction([
    prisma.suscripcionEmpresa.update({
      where: { id: localSub.id },
      data: {
        estadoSuscripcion: "ACTIVA",
      },
    }),

    prisma.empresa.update({
      where: { id: localSub.empresaId },
      data: {
        whatsappHabilitado: localSub.planTipo === "PRO",
      },
    }),
  ]);
}
