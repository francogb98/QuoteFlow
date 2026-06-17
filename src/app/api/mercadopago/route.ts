import { Payment } from "mercadopago";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { auth } from "@/auth.config";

import { config } from "@/lib/mercadopago/mercadopago.config";
import { updateUserPayment } from "@/actions/users/public";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();

    const payment = await new Payment(config).get({ id: body.paymentId });

    if (payment.status === "approved") {
      await updateUserPayment(payment);
      revalidatePath("/"); // Esto solo funciona si se llama desde un Server Component
    }

    return NextResponse.json({ success: true, payment });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Error processing notification" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const comprobante = searchParams.get("comprobante"); // <-- Usa query params

    if (!comprobante) {
      return NextResponse.json(
        { error: "comprobante es requerido" },
        { status: 400 }
      );
    }

    const payment = await new Payment(config).get({ id: comprobante });
    return NextResponse.json({ success: true, payment });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener el pago" },
      { status: 500 }
    );
  }
}
