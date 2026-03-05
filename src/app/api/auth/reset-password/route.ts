import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { token, password } = await req.json();

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken) {
    return Response.json({ error: "Token inválido" }, { status: 400 });
  }

  if (resetToken.expiresAt < new Date()) {
    return Response.json({ error: "Token expirado" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  await prisma.administrador.update({
    where: { id: resetToken.adminId },
    data: { password: hashed },
  });

  await prisma.passwordResetToken.delete({
    where: { token },
  });

  return Response.json({ success: true });
}
