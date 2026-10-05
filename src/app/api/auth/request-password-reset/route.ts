import prisma from "@/lib/prisma";
import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { documento } = await req.json();

    if (!documento) {
      return NextResponse.json(
        { error: "Falta el documento." },
        { status: 400 }
      );
    }

    const admin = await prisma.administrador.findUnique({
      where: { documento },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "No se encontró una cuenta con ese DNI." },
        { status: 404 }
      );
    }

    const rawSession = crypto.randomBytes(32).toString("hex");
    const sessionHash = crypto
      .createHash("sha256")
      .update(rawSession)
      .digest("hex");

    const expiresAt = new Date(Date.now() + 1000 * 60 * 10);

    await prisma.passwordResetSession.deleteMany({
      where: { adminId: admin.id },
    });

    await prisma.passwordResetSession.create({
      data: {
        sessionHash,
        adminId: admin.id,
        expiresAt,
      },
    });

    return NextResponse.json({
      redirect: `/auth/reset-password?session=${rawSession}`,
    });
  } catch (error) {
    console.error("Error en request-password-reset:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
