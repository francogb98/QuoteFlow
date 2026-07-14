"use server";

import { Resend } from "resend";
import { PasswordResetEmailTemplate } from "./PasswordResetEmailTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail({
  to,
  nombre,
  rawToken,
}: {
  to: string;
  nombre: string;
  rawToken: string;
}) {
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  // Token goes to the exchange API endpoint, not to a user-visible page.
  // The server will exchange it for a secure httpOnly cookie and redirect to /auth/reset-password.
  const resetLink = `${baseUrl}/api/auth/verify-reset-token?token=${rawToken}`;

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
