// sendReminderEmail.ts
"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface ReminderEmailProps {
  nombre: string;
  apellido: string;
  empresa: string;
  documento: string;
  to: string;
  // ACTUALIZADO: Agregamos "VENCIDO"
  newStatus: "VENCE_HOY" | "FALTA_3_DIAS" | "VENCIDO";
  motivo: string;
}

export async function sendReminderEmail(content: ReminderEmailProps) {
  const { nombre, apellido, empresa, documento, to, newStatus, motivo } =
    content;

  // Lógica de colores y títulos
  let colorHeader = "#f9a825"; // Amarillo por defecto (Próximo a vencer)
  let titulo = "Tu pago está por vencer";

  if (newStatus === "VENCE_HOY") {
    colorHeader = "#e53935"; // Rojo
    titulo = "¡Tu pago vence hoy!";
  } else if (newStatus === "VENCIDO") {
    colorHeader = "#b71c1c"; // Rojo oscuro
    titulo = "Tu pago está vencido"; // Mensaje diferenciado
  }

  const emailHTML = `
    <div style="font-family: Arial, sans-serif; background-color: #f0f2f5; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 12px; padding: 30px; box-shadow: 0 8px 16px rgba(0,0,0,0.08);">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://cuotafacil.com.ar/Logo.png" alt="Logo" style="max-width: 150px; height: auto;" />
        </div>
        <h2 style="color: ${colorHeader}; text-align: center;">${titulo}</h2>
        <p>Hola <b>${nombre} ${apellido}</b>,</p>
        <p>Desde <b>${empresa}</b> te recordamos que ${motivo}.</p>
        <p style="text-align:center; margin-top: 30px;">
          <a href="https://cuotafacil.com.ar/${empresa}/${documento}" 
             style="background-color: ${colorHeader}; color: #fff; padding: 15px 25px; border-radius: 8px; text-decoration: none; font-weight: bold;">
             Ver detalles y pagar
          </a>
        </p>
        <p style="margin-top: 30px; color: #999; font-size: 13px; text-align: center;">
          Si tienes alguna duda, contáctanos. ¡Gracias por confiar en Cuota Fácil!
        </p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "CuotaFacil <no-reply@cuotafacil.com.ar>",
      to: [to],
      subject: titulo,
      html: emailHTML,
    });
    return { success: true };
  } catch (error) {
    console.error("Error enviando email:", error);
    return { success: false, error };
  }
}
