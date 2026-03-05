"use server";

import { Resend } from "resend";
import { PasswordResetEmailTemplate } from "./PasswordResetEmailTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail({
  to,
  nombre,
  token,
}: {
  to: string;
  nombre: string;
  token: string;
}) {
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  const resetLink = `${baseUrl}/auth/reset-password?token=${token}`;

  await resend.emails.send({
    from: "CuotaFacil <no-reply@cuotafacil.com.ar>",
    to: [to],
    subject: "Restablecer contraseña",
    react: PasswordResetEmailTemplate({
      nombre,
      resetLink,
    }),
  });
}
