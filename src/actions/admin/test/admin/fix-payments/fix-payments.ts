"use server";
import { fixIncorrectPayments } from "@/lib/cron/01-payments/lib/fixIncorrectPayments";

export async function runFixIncorrectPayments(input?: {
  year?: number;
  months?: number[];
  adminId?: string;
  onlyPending?: boolean;
}) {
  try {
    const year = Number(input?.year ?? new Date().getFullYear());
    const months =
      Array.isArray(input?.months) && input!.months.length > 0
        ? input!.months.map(Number)
        : [new Date().getMonth() + 1];

    const adminId = input?.adminId;
    const onlyPending =
      input?.onlyPending === undefined ? true : Boolean(input.onlyPending);

    const result = await fixIncorrectPayments({
      year,
      months,
      adminId,
      onlyPending,
    });

    return { ok: true, result };
  } catch (err) {
    console.error("[runFixIncorrectPayments] Error:", err);
    return { ok: false, error: String(err) };
  }
}
