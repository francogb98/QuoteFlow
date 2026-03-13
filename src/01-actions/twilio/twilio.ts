"use server";

import twilio from "twilio";

const formatPhoneNumber = (rawPhone: string | null): string | null => {
  if (!rawPhone) return null;
  let cleaned = rawPhone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) cleaned = cleaned.substring(1);
  if (!cleaned.startsWith("54") && cleaned.length < 12)
    cleaned = "54" + cleaned;
  return `+${cleaned}`;
};

export async function sendWhatsAppReminder({
  telefono,
  usuarioNombre,
  fechaVencimiento,
  empresa,
  documento,
  linkPago,
  tipo,
}: {
  telefono: string | null;
  usuarioNombre: string;
  fechaVencimiento: string | null;
  empresa: string;
  documento: string;
  linkPago: string;
  tipo: "pendiente" | "vencido";
}) {
  // 1. Forzamos tu número de teléfono real para la prueba
  //const testPhone = "3855956688"; // Tu número sin el 9 inicial
  const phoneToUse = telefono; // Usamos el que viene, o podrías hardcodear: formatPhoneNumber(testPhone);

  if (!phoneToUse) return { success: false, error: "Sin teléfono" };

  const toNumber = formatPhoneNumber(phoneToUse);
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

  // 2. Usamos la PLANTILLA PERSONALIZADA
  const contentSid =
    tipo === "vencido"
      ? process.env.TWILIO_CONTENT_SID_VENCIDO
      : process.env.TWILIO_CONTENT_SID_PENDIENTE;

  console.log(contentSid);

  if (!accountSid || !authToken || !fromNumber || !contentSid) {
    return { success: false, error: "Faltan credenciales Twilio" };
  }

  const urlFrontend = process.env.FRONTEND_URL || "http://localhost:3000";

  const linkPagoCompleto = `https://cuotafacil.com.ar/${empresa}/${documento}`;

  try {
    const client = twilio(accountSid, authToken);

    const fechaVencimientoFormateada = fechaVencimiento
      ? new Date(fechaVencimiento).toLocaleDateString("es-AR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "sin fecha";

    const mes = fechaVencimiento
      ? new Date(fechaVencimiento).toLocaleDateString("es-AR", {
          month: "long",
          year: "numeric",
        })
      : "";

    const contentVariables = JSON.stringify({
      1: usuarioNombre,
      2: empresa,
      3: mes,
      4: fechaVencimientoFormateada,
      5: linkPagoCompleto,
    });

    const message = await client.messages.create({
      from: fromNumber, // ej: whatsapp:+1555...
      to: `whatsapp:${+543853101640}`, // ¡IMPORTANTE: El prefijo whatsapp:
      contentSid: contentSid,
      contentVariables: contentVariables,
    });

    console.log(message);

    return { success: true };
  } catch (error: any) {
    console.error("Error Twilio:", error);
    return { success: false, error: error.message };
  }
}
