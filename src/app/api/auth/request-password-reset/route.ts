import { sendPasswordResetEmail } from "@/01-actions/admin/emails/sendPasswordResetEmail";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  const { documento } = await req.json();

  const admin = await prisma.administrador.findUnique({
    where: { documento },
  });

  if (!admin) {
    return Response.json({
      message:
        "Si existe una cuenta con ese DNI, recibirás un email con instrucciones.",
    });
  }

  const token = crypto.randomBytes(32).toString("hex");

  const expires = new Date(Date.now() + 1000 * 60 * 60);

  await prisma.passwordResetToken.create({
    data: {
      token,
      adminId: admin.id,
      expiresAt: expires,
    },
  });

  await sendPasswordResetEmail({
    to: admin.email,
    nombre: admin.nombre,
    token,
  });

  return Response.json({
    message: "Se ha enviado un correo con instrucciones.",
  });
}
