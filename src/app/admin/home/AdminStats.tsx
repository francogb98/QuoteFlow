"use client";
import { useEffect, useState } from "react";

import { getAdminStats } from "@/01-actions/admin/home/getAdminStats";

import { RecentPaymentsTable } from "@/01-components/admin/home/recent-payments-table";
import { StatsGrid } from "@/01-components/admin/home/stats-grid";
import { UpcomingPaymentsTable } from "@/01-components/admin/home/upcoming-payments-table";
import { MonthSelector } from "@/01-components/admin/home/month-selector";

export default function AdminStats() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [data, setData] = useState<Awaited<
    ReturnType<typeof getAdminStats>
  > | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const result = await getAdminStats(selectedDate);
      setData(result);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos en el primer render
  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const handleDateChange = (newDate: Date) => {
    setSelectedDate(newDate);
  };

  if (isLoading || !data) {
    return (
      <main className="space-y-4 p-4">
        <h2 className="mb-4 text-xl font-semibold text-center">
          Estadísticas del Mes
        </h2>
        <MonthSelector
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border p-4 shadow-sm animate-pulse space-y-3 bg-card"
            >
              <div className="h-4 w-2/3 bg-muted rounded"></div>
              <div className="h-6 w-1/2 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </main>
    );
  }
  return (
    <div className="p-1.5">
      {/* KPIs Grid */}
      <section className="space-y-4 pb-4">
        <h2 className="mb-4 text-xl font-semibold text-center">
          Estadísticas del Mes
        </h2>
        <MonthSelector
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
        />
        {/* <section className="flex justify-center">
          <MonthSelector
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
          />
        </section> */}
        <StatsGrid kpis={data.kpis} />
      </section>

      {/* Upcoming Payments & Recent Payments */}
      <div className="grid gap-8 lg:grid-cols-2">
        <section className="overflow-auto">
          <h2 className="mb-4 font-semibold">Próximos Vencimientos</h2>
          <UpcomingPaymentsTable pagos={data.proximosVencimientos} />
        </section>

        <section className="overflow-auto">
          <h2 className="mb-4 font-semibold">Últimos Pagos Registrados</h2>
          <RecentPaymentsTable pagos={data.ultimosPagos} />
        </section>
      </div>
    </div>
  );
}
