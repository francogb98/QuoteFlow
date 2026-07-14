import { sendPasswordResetEmail } from "@/actions/admin/emails/sendPasswordResetEmail";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  const { documento } = await req.json();

  const admin = await prisma.administrador.findUnique({
    where: { documento },
  });

  // Always return the same message to prevent user enumeration
  if (!admin) {
    return Response.json({
      message:
        "Si existe una cuenta con ese DNI, recibirás un email con instrucciones.",
    });
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  // 15-minute expiration
  const expiresAt = new Date(Date.now() + 1000 * 60 * 15);

  // Delete any existing tokens for this admin before creating a new one
  await prisma.passwordResetToken.deleteMany({
    where: { adminId: admin.id },
  });

  await prisma.passwordResetToken.create({
    data: {
      tokenHash,
      adminId: admin.id,
      expiresAt,
    },
  });

  await sendPasswordResetEmail({
    to: admin.email,
    nombre: admin.nombre,
    rawToken,
  });

  return Response.json({
    message: "Se ha enviado un correo con instrucciones.",
  });
}
