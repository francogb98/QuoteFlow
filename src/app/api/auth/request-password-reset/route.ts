import { NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";
import prisma from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { documento } = await req.json();

    if (!documento) {
      return NextResponse.json({ error: "Missing documento" }, { status: 400 });
    }

    // Buscar por documento (DNI)
    const admin = await prisma.administrador.findUnique({
      where: { documento },
    });

    // Si no existe, respondemos de forma genérica (evita enumeración)
    if (!admin) {
      const support = process.env.SUPPORT_EMAIL || "soporte@cuotafacil.com.ar";
      return NextResponse.json(
        {
          ok: true,
          message:
            "Si existe una cuenta con ese DNI, se ha enviado un correo con instrucciones. " +
            `Si no recibes el email o no puedes acceder al mismo, contacta a soporte: ${support}.`,
        },
        { status: 200 }
      );
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await prisma.administrador.update({
      where: { id: admin.id },
      data: {
        resetPasswordTokenHash: tokenHash,
        resetPasswordExpires: expires,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${appUrl}/auth/reset-password?token=${token}&id=${admin.id}`;

    const html = `
      <div style="font-family: Arial, sans-serif; background: #f6f8fa; padding: 24px;">
        <div style="max-width:600px;margin:auto;background:#fff;padding:24px;border-radius:8px;">
          <h2>Restablecer contraseña</h2>
          <p>Hola ${admin.nombre},</p>
          <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón para continuar (válido por 1 hora).</p>
          <p style="text-align:center;margin:24px 0;">
            <a href="${resetLink}" style="background:#2563eb;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;">Restablecer contraseña</a>
          </p>
          <p style="color:#666;font-size:12px">Si no solicitaste este cambio, puedes ignorar este correo.</p>
        </div>
      </div>
    `;

    try {
      await resend.emails.send({
        from: "CuotaFácil <no-reply@cuotafacil.com.ar>",
        to: [admin.email],
        subject: "Restablecer contraseña",
        html,
      });
    } catch (err) {
      console.error("Error enviando correo con Resend:", err);
      // No fallamos la respuesta por seguridad; igual devolvemos mensaje de éxito para usuario
    }

    const support = process.env.SUPPORT_EMAIL || "soporte@cuotafacil.com.ar";
    return NextResponse.json(
      {
        ok: true,
        message: `Se ha enviado un correo a ${admin.email} con las instrucciones para restablecer la contraseña. Si no puedes acceder a ese correo, contacta a soporte: ${support}.`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en forgot-password:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
