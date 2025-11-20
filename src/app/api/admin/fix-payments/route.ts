import { NextResponse } from "next/server";
import { fixIncorrectPayments } from "@/lib/cron/01-payments/lib/fixIncorrectPayments";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const year = Number(body.year ?? new Date().getFullYear());
    const months =
      Array.isArray(body.months) && body.months.length > 0
        ? body.months.map(Number)
        : [new Date().getMonth() + 1];
    const adminId = body.adminId ?? undefined;
    const onlyPending =
      body.onlyPending === undefined ? true : Boolean(body.onlyPending);

    const result = await fixIncorrectPayments({
      year,
      months,
      adminId,
      onlyPending,
    });
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error("[api/admin/fix-payments] Error:", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
