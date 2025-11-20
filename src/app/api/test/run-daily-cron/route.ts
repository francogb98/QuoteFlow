import { NextResponse } from "next/server";
import { processDailyComplete } from "@/lib/cron/01-payments/daily";

export async function POST() {
  try {
    const result = await processDailyComplete();
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error(
      "[api/test/run-daily-cron] Error ejecutando cron diario:",
      err
    );
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}

export const GET = POST;
