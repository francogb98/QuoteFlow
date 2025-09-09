import { type NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(request: NextRequest) {
  try {
    const { to, message, nombre } = await request.json();

    const templateName = "notifications_appointment_confirmation_template";

    const resp = await client.messages.create({
      contentSid: "HX165bc64fd5b83fac491b97fd8ba59952", // ID de la plantilla Twilio
      from: "whatsapp:+15557745433",
      to: `whatsapp:${to}`,
      contentVariables: JSON.stringify({
        first_name: nombre,
        date: "10/58/2023",
        time: "16:00",
      }),
    });

    console.log(resp);

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("Error verificando número:", error);

    return NextResponse.json(
      { error: "Número de teléfono inválido" },
      { status: 400 }
    );
  }
}
