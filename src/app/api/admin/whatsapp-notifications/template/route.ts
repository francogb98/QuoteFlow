import { NextResponse } from "next/server";
import { getSuperAdminAccess } from "@/lib/auth/require-super-admin";
import { saveWhatsAppTemplate } from "@/lib/data/super-admin-whatsapp";

export async function POST(request: Request) {
  const access = await getSuperAdminAccess();

  if (!access.ok) {
    return NextResponse.json(
      { error: access.error },
      { status: access.status },
    );
  }

  const formData = await request.formData();
  const template = String(formData.get("template") ?? "");

  try {
    await saveWhatsAppTemplate(template, access.session.user.id);
  } catch (error) {
    const fallbackUrl = new URL(
      "/admin/super-admin/whatsapp-notifications",
      request.url,
    );
    fallbackUrl.searchParams.set(
      "templateError",
      error instanceof Error ? error.message : "No se pudo guardar el template",
    );
    return NextResponse.redirect(fallbackUrl);
  }

  const successUrl = new URL(
    "/admin/super-admin/whatsapp-notifications",
    request.url,
  );
  successUrl.searchParams.set("templateSaved", "1");
  return NextResponse.redirect(successUrl);
}
