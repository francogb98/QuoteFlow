"use client";

import { PaymentsChart } from "./nuevo/payments-chart";

export function PaymentCharts({ kpis, monthlyTrends, selectedDate }: any) {
  // Prefer server-provided monthlyTrends, otherwise fallback to mock inside PaymentsChart
  return <PaymentsChart data={monthlyTrends} />;
}

export default PaymentCharts;
