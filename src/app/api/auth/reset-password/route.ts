import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const rawSession = cookieStore.get("reset_session")?.value;

  if (!rawSession) {
    return Response.json(
      { error: "Sesión de restablecimiento inválida o expirada." },
      { status: 401 },
    );
  }

  const sessionHash = crypto
    .createHash("sha256")
    .update(rawSession)
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

  const { password } = await req.json();

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

  // Invalidate the session immediately
  await prisma.passwordResetSession.delete({ where: { sessionHash } });

  // Clear the cookie
  const response = Response.json({ success: true });
  const headers = new Headers(response.headers);
  headers.append(
    "Set-Cookie",
    "reset_session=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/",
  );

  return new Response(response.body, { status: 200, headers });
}
