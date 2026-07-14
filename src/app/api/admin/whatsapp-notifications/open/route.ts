import { NextResponse } from "next/server";
import { getSuperAdminAccess } from "@/lib/auth/require-super-admin";
import {
  buildWhatsAppSendPayload,
  registerManualWhatsAppClick,
} from "@/lib/data/super-admin-whatsapp";

export async function GET(request: Request) {
  const access = await getSuperAdminAccess();

  if (!access.ok) {
    return NextResponse.json(
      { error: access.error },
      { status: access.status },
    );
  }

  const { searchParams } = new URL(request.url);
  const usuarioId = searchParams.get("usuarioId") ?? "";
  const pagoId = searchParams.get("pagoId") ?? "";

  if (!usuarioId || !pagoId) {
    return NextResponse.json(
      { error: "Parámetros inválidos" },
      { status: 400 },
    );
  }

  const payloadResult = await buildWhatsAppSendPayload({ usuarioId, pagoId });

  if (!payloadResult) {
    return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });
  }

  if (payloadResult.kind === "invalid_phone") {
    return NextResponse.json({ error: payloadResult.message }, { status: 422 });
  }

  await registerManualWhatsAppClick({
    ...payloadResult.payload,
    adminId: access.session.user.id,
  });

  return NextResponse.redirect(payloadResult.payload.waUrl);
}
