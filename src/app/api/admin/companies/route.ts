import { NextResponse } from "next/server";
import { getSuperAdminAccess } from "@/lib/auth/require-super-admin";
import {
  getSuperAdminCompanies,
  getSuperAdminOverview,
} from "@/lib/data/super-admin-dashboard";

export async function GET(request: Request) {
  const access = await getSuperAdminAccess();

  if (!access.ok) {
    return NextResponse.json(
      { error: access.error },
      { status: access.status },
    );
  }

  const { searchParams } = new URL(request.url);
  const [overview, companies] = await Promise.all([
    getSuperAdminOverview(),
    getSuperAdminCompanies({
      page: Number(searchParams.get("page") ?? "1"),
      pageSize: Number(searchParams.get("pageSize") ?? "10"),
      search: searchParams.get("search") ?? "",
      subscriptionStatus:
        (searchParams.get("subscriptionStatus") as any) ?? "all",
      paymentStatus: (searchParams.get("paymentStatus") as any) ?? "all",
      activity: (searchParams.get("activity") as any) ?? "all",
    }),
  ]);

  return NextResponse.json({ overview, ...companies });
}
