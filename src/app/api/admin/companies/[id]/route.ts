import { NextResponse } from "next/server";
import { getSuperAdminAccess } from "@/lib/auth/require-super-admin";
import { getSuperAdminCompanyDetail } from "@/lib/data/super-admin-dashboard";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const access = await getSuperAdminAccess();

  if (!access.ok) {
    return NextResponse.json(
      { error: access.error },
      { status: access.status },
    );
  }

  const { id } = await context.params;
  const detail = await getSuperAdminCompanyDetail(id);

  if (!detail) {
    return NextResponse.json(
      { error: "Empresa no encontrada" },
      { status: 404 },
    );
  }

  return NextResponse.json(detail);
}
