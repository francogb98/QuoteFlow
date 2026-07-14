"use server";

import { runDailyPaymentsCron } from "@/lib/cron/01-payments/daily/orchestrator";

export async function runOrchestrator(dateInput?: string | Date) {
  try {
    const date =
      dateInput instanceof Date
        ? dateInput
        : dateInput
          ? new Date(dateInput)
          : new Date();

    const result = await runDailyPaymentsCron(date);

    return { ok: true, result };
  } catch (err) {
    console.error("[runOrchestrator] Error:", err);
    return { ok: false, error: String(err) };
  }
}
