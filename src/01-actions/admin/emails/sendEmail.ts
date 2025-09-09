"use server";

import { Resend } from "resend";
import { EmailTemplate } from "./EmailTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailContent {
  nombre: string;
  apellido: string;
  dueDate: string;
  daysUntilDue: number;
  empresa: string;
  documento: string;
  to: string;
}

export async function sendEmail(content: EmailContent) {
  try {
    const { nombre, apellido, dueDate, daysUntilDue, empresa, documento, to } =
      content;

    const { data, error } = await resend.emails.send({
      from: "CuotaFacil <no-reply@cuotafacil.com.ar>",
      to: [to],
      subject: "Hello world",
      react: EmailTemplate({
        firstName: `${nombre} ${apellido}`,
        dueDate: dueDate,
        daysUntilDue: daysUntilDue,
        paymentLink: `https://cuotafacil.com.ar/${empresa}/${documento}`,
      }),
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error al enviar email:", error);
    throw error;
  }
}
