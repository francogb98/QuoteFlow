import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;
const contentSidVencido = process.env.TWILIO_CONTENT_SID_VENCIDO;
const contentSidPendiente = process.env.TWILIO_CONTENT_SID_PENDIENTE;

export async function POST(req: NextRequest) {
  try {
    const { to, template } = await req.json();

    if (!to) {
      return NextResponse.json(
        { error: "Falta el número de teléfono (to)" },
        { status: 400 }
      );
    }

    if (!accountSid || !authToken || !fromNumber) {
      return NextResponse.json(
        {
          error: "Faltan variables de entorno de Twilio",
          missing: {
            TWILIO_ACCOUNT_SID: !accountSid,
            TWILIO_AUTH_TOKEN: !authToken,
            TWILIO_WHATSAPP_NUMBER: !fromNumber,
          },
        },
        { status: 500 }
      );
    }

    const contentSid =
      template === "pendiente" ? contentSidPendiente : contentSidVencido;

    if (!contentSid) {
      return NextResponse.json(
        {
          error: `No hay Content SID para el template "${template}"`,
          available: {
            vencido: !!contentSidVencido,
            pendiente: !!contentSidPendiente,
          },
        },
        { status: 500 }
      );
    }

    const client = twilio(accountSid, authToken);

    const from = fromNumber.startsWith("whatsapp:")
      ? fromNumber
      : `whatsapp:${fromNumber}`;

    // Variables de ejemplo para el template
    const contentVariables = JSON.stringify({
      nombre: "Juan",
      monto: "25000",
      fecha_vencimiento: "5 jul 2026",
    });

    const message = await client.messages.create({
      from,
      to: `whatsapp:${to}`,
      contentSid,
      contentVariables,
    });

    return NextResponse.json({
      success: true,
      sid: message.sid,
      status: message.status,
      template: template || "vencido",
      contentSid,
    });
  } catch (error: unknown) {
    console.error("Error enviando WhatsApp:", error);

    const message =
      error instanceof Error ? error.message : "Error desconocido";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
