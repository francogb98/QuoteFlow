import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("me ejecute", body);

    const { usuarioId, endpoint, keys } = body;

    if (!usuarioId || !endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const userAgent = req.headers.get("user-agent") ?? null;

    // Upsert por endpoint (evita duplicados)
    const subscription = await prisma.pushSubscription.upsert({
      where: {
        endpoint,
      },
      update: {
        p256dh: keys.p256dh,
        auth: keys.auth,
        usuarioId,
        userAgent,
      },
      create: {
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        usuarioId,
        userAgent,
      },
    });

    console.log({ subscription });

    return NextResponse.json({
      ok: true,
      subscriptionId: subscription.id,
    });
  } catch (error) {
    console.error("Subscribe error:", error);

    return NextResponse.json(
      { error: "Error guardando suscripción" },
      { status: 500 },
    );
  }
}
