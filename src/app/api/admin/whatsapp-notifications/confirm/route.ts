import { NextResponse } from "next/server";
import { getSuperAdminAccess } from "@/lib/auth/require-super-admin";
import { confirmWhatsAppNotificationSent } from "@/lib/data/super-admin-whatsapp";

export async function POST(request: Request) {
  const access = await getSuperAdminAccess();

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const formData = await request.formData();
  const usuarioId = String(formData.get("usuarioId") ?? "");
  const pagoId = String(formData.get("pagoId") ?? "");
  const returnTo =
    String(formData.get("returnTo") ?? "") ||
    "/admin/super-admin/whatsapp-notifications";

  if (!usuarioId || !pagoId) {
    const errorUrl = new URL(returnTo, request.url);
    errorUrl.searchParams.set("actionError", "Parámetros inválidos");
    return NextResponse.redirect(errorUrl);
  }

  try {
    await confirmWhatsAppNotificationSent({
      usuarioId,
      pagoId,
      adminId: access.session.user.id,
    });
  } catch (error) {
    const errorUrl = new URL(returnTo, request.url);
    errorUrl.searchParams.set(
      "actionError",
      error instanceof Error
        ? error.message
        : "No se pudo confirmar el envío",
    );
    return NextResponse.redirect(errorUrl);
  }

  const successUrl = new URL(returnTo, request.url);
  successUrl.searchParams.set("actionSuccess", "sent");
  return NextResponse.redirect(successUrl);
}