import { KPICard } from "./kpi-card";

interface StatsGridProps {
  kpis: {
    usuariosNuevosMes: number;
    totalUsuariosActivos: number;
    pagosRecibidosMes: number;
    totalFacturadoMes: number;
    pagosVencidosMes: number;
    montoPendiente: number;
    conteoPagesPendientes: number;
    conteoPageVencidos: number;
    conteoPagePagados: number;
  };
}

export function StatsGrid({ kpis }: StatsGridProps) {
  const totalPagosVencidosYPendientes =
    kpis.conteoPageVencidos + kpis.conteoPagesPendientes;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        label="Pagos Recibidos Este Mes"
        value={`$${kpis.pagosRecibidosMes.toFixed(2)}`}
        variant="success"
      />

      <KPICard
        label="Pagos Vencidos Este Mes"
        value={`$${kpis.pagosVencidosMes.toFixed(2)} (${kpis.conteoPageVencidos})`}
        variant="danger"
      />

      {/* Tarjeta modificada para aclarar que incluye vencidos */}
      <KPICard
        label="Monto Pendiente (incluye vencidos)"
        value={`$${kpis.montoPendiente.toFixed(2)} (${totalPagosVencidosYPendientes})`}
        variant="warning"
      />

      <KPICard
        label="Total Facturado Este Mes (total de pagos)"
        value={`$${kpis.totalFacturadoMes.toFixed(2)}`}
        variant="default"
      />
      <KPICard
        label="Usuarios Nuevos Este Mes"
        value={kpis.usuariosNuevosMes}
        variant="success"
      />
      <KPICard
        label="Total Usuarios Activos"
        value={kpis.totalUsuariosActivos}
        variant="default"
      />
    </div>
  );
}
