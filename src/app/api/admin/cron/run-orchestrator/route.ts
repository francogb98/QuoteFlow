import { NextResponse } from "next/server";
import { runDailyPaymentsCron } from "@/lib/cron/01-payments/daily/orchestrator";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const date = body?.date ? new Date(body.date) : new Date();
    const result = await runDailyPaymentsCron(date);
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error("[api/admin/cron/run-orchestrator] Error:", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
