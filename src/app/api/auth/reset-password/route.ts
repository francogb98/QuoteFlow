import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { password, session } = await req.json();

    if (!session) {
      return Response.json(
        { error: "Sesión de restablecimiento inválida o expirada." },
        { status: 401 },
      );
    }

    const sessionHash = crypto
      .createHash("sha256")
      .update(session)
      .digest("hex");

    const resetSession = await prisma.passwordResetSession.findUnique({
      where: { sessionHash },
    });

    if (!resetSession || resetSession.expiresAt < new Date()) {
      if (resetSession) {
        await prisma.passwordResetSession.delete({ where: { sessionHash } });
      }
      return Response.json(
        { error: "Sesión de restablecimiento inválida o expirada." },
        { status: 401 },
      );
    }

    if (!password || password.length < 6) {
      return Response.json(
        { error: "La contraseña debe tener al menos 6 caracteres." },
        { status: 400 },
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    await prisma.administrador.update({
      where: { id: resetSession.adminId },
      data: { password: hashed },
    });

    await prisma.passwordResetSession.delete({ where: { sessionHash } });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error en reset-password:", error);
    return Response.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}
