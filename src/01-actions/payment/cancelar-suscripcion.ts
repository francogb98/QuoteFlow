"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/*";
import { MercadoPagoConfig, PreApproval } from "mercadopago";
import { revalidatePath } from "next/cache";

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

export async function cancelarSuscripcion() {
  try {
    const session = await auth();

    if (!session?.user?.empresaId) {
      throw new Error("No autorizado");
    }

    const empresa = await prisma.empresa.findUnique({
      where: { id: session.user.empresaId },
      include: { suscripcion: true },
    });

    if (!empresa?.suscripcion?.mercadoPagoPreApprovalId) {
      throw new Error("No existe suscripción válida");
    }

    const preapproval = new PreApproval(mpClient);

    // ✅ Forma correcta para tu SDK
    await preapproval.update({
      id: empresa.suscripcion.mercadoPagoPreApprovalId,
      body: { status: "cancelled" },
    });

    await prisma.suscripcionEmpresa.update({
      where: { empresaId: empresa.id },
      data: {
        estadoSuscripcion: "CANCELADA",
      },
    });

    revalidatePath("/suscripcion");
    revalidatePath("/admin/suscripcion");

    return { ok: true };
  } catch (error) {
    console.error("Error cancelando suscripción:", error);
    return { ok: false };
  }
}
