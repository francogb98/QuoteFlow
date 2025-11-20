import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { id, token, password } = await req.json();

    if (!id || !token || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const admin = await prisma.administrador.findUnique({ where: { id } });

    // Validaciones básicas
    if (
      !admin ||
      !admin.resetPasswordTokenHash ||
      !admin.resetPasswordExpires
    ) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // Verificar token
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    if (tokenHash !== admin.resetPasswordTokenHash) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    // Verificar expiración
    if (admin.resetPasswordExpires.getTime() < Date.now()) {
      return NextResponse.json({ error: "Token expired" }, { status: 400 });
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Actualizar y limpiar el token
    await prisma.administrador.update({
      where: { id },
      data: {
        password: hashedPassword,
        resetPasswordTokenHash: null,
        resetPasswordExpires: null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error en reset-password:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
