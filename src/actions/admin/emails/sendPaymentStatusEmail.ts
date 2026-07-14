"use server";

import { Resend } from "resend";
import { EmailTemplate } from "./EmailTemplate";
import { PaymentEmailTemplate } from "./PaymentEmailTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailContent {
  nombre: string;
  apellido: string;
  empresa: string;
  documento: string;
  to: string;
  newStatus: string;
  motivo: string | null;
}

export async function sendPaymentStatusEmail(content: EmailContent) {
  try {
    const { nombre, apellido, empresa, documento, to, newStatus, motivo } =
      content;

    const status = newStatus === "PAGADO" ? "Aprobado" : "Rechazado";

    const { data, error } = await resend.emails.send({
      from: "CuotaFacil <no-reply@cuotafacil.com.ar>",
      to: [to],
      subject: `Aviso de pago: ${status}`,
      react: PaymentEmailTemplate({
        firstName: `${nombre} ${apellido}`,
        paymentLink: `https://cuotafacil.com.ar/${empresa}/${documento}`,
        newStatus: status,
        motivo: motivo,
      }),
    });

    if (error) {
      console.log(error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log("Correo electrónico enviado con éxito:", data);

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error al enviar email:", error);
    return {
      success: false,
      error: "Error al enviar el correo electrónico.",
    };
  }
}
