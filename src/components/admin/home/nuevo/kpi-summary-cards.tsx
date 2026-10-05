import { KpiData } from "@/lib/data/dashboardQueries";

interface KpiSummaryCardsProps {
  data: KpiData;
}

export function KpiSummaryCards({ data }: KpiSummaryCardsProps) {
  const cards = [
    {
      label: "Total Cobrado",
      value: `$${data.totalRecaudado.toLocaleString("es-AR")}`,
      valueColor: "text-emerald-600",
    },
    {
      label: "Pagos Pendientes",
      value: `$${data.totalPendienteMonto.toLocaleString("es-AR")}`,
      valueColor: "text-amber-500",
    },
    {
      label: "Cuotas Vencidas",
      value: `$${data.totalVencidoMonto.toLocaleString("es-AR")}`,
      valueColor: "text-rose-600",
    },
    {
      label: "Total Activos",
      value: `${data.totalUsuarios} usuarios`,
      valueColor: "text-primary",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-border bg-card px-2.5 py-2 shadow-sm"
        >
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {card.label}
          </p>
          <p className={`mt-0.5 text-base font-bold ${card.valueColor}`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}