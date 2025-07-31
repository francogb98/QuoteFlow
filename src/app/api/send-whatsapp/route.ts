import { type NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(request: NextRequest) {
  try {
    const { to, message } = await request.json();

    const messageData = await client.messages.create({
      body: message,
      from: "whatsapp:+5493855956688",
      to: to,
    });

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
