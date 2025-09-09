import { NextResponse } from "next/server";
import { auth } from "@/*";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({
        connected: false,
        error: "No autenticado",
      });
    }

    const admin = await prisma.administrador.findUnique({
      where: { id: session.user.id },
      select: {
        claveMercadoPago: true,
        tokenMercadoPagoExpiresAt: true,
      },
    });

    const isConnected = !!admin?.claveMercadoPago;
    const isExpired = admin?.tokenMercadoPagoExpiresAt
      ? new Date() > admin.tokenMercadoPagoExpiresAt
      : false;

    return NextResponse.json({
      connected: isConnected && !isExpired,
      expired: isExpired,
      hasToken: !!admin?.claveMercadoPago,
    });
  } catch (error) {
    console.error("Error verificando estado de MercadoPago:", error);
    return NextResponse.json({
      connected: false,
      error: "Error interno",
    });
  }
}
