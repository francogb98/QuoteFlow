"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserRow } from "@/lib/data/dashboardQueries";
import { KpiSummaryCards } from "./kpi-summary-cards";
import {
  KpiData,
  RecentPaymentRow,
  UsersOverviewData,
} from "@/lib/data/dashboardQueries";
import { UsersPaymentTable } from "./users-payment-table";
import { PaymentsChart, CurrentMonthDonutData } from "./payments-chart";
import { RecentPaymentsFeed } from "./recent-payments-feed";
import { useAdminPanelStore } from "@/lib/store/useAdminPanelStore";
import { ModalEditPayment } from "@/components/admin/users/user/pagos/ModalEditPayment";
import { Users, DollarSign } from "lucide-react";

interface DashboardContentProps {
  kpis: KpiData;
  users: UserRow[];
  recentPayments: RecentPaymentRow[];
  usersOverview: UsersOverviewData;
}

export function DashboardContent({
  kpis,
  users,
  recentPayments,
  usersOverview,
}: DashboardContentProps) {
  const openUser = useAdminPanelStore((s) => s.openUser);
  const router = useRouter();

  const [cobroUser, setCobroUser] = useState<UserRow | null>(null);
  const [selectedPago, setSelectedPago] = useState<any>(null);

  const handleCobrar = useCallback((user: UserRow) => {
    const pagoPendiente = user.pagos?.find((p) => p.estado !== "PAGADO");
    if (!pagoPendiente) return;

    setSelectedPago(pagoPendiente);
    setCobroUser(user);
  }, []);

  const handleCloseCobro = useCallback(() => {
    setCobroUser(null);
    setSelectedPago(null);
    router.refresh();
  }, [router]);

  const pagosParaModal =
    cobroUser?.pagos?.filter((p) => p.estado !== "PAGADO") ?? [];

  const currentMonthDonut: CurrentMonthDonutData = {
    pagados: usersOverview.pagaronEsteMes,
    pendientes: usersOverview.pendientesEsteMes,
    vencidos: usersOverview.vencidosEsteMes,
  };

  return (
    <div className="flex h-full flex-col space-y-2">
      <KpiSummaryCards data={kpis} />

      <div className="flex min-h-0 flex-1 flex-col gap-2">
        {/* 2-column grid: 70% table | 30% chart + recent payments */}
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 lg:grid-cols-[70%_30%]">
          {/* Left: Header + Users table */}
          <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">
                  Gestión de Usuarios
                </h2>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {users.length}
                </span>
              </div>
            </div>
            <div className="min-h-0 flex-1">
              <UsersPaymentTable
                users={users}
                onViewUser={(id) => openUser(id)}
                onCobrar={handleCobrar}
              />
            </div>
          </div>

          {/* Right: Chart + Recent payments feed */}
          <div className="flex flex-col gap-2">
            {/* Chart block */}
            <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
              <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-xs font-semibold text-card-foreground">
                  Estado del Mes Actual
                </span>
              </div>
              <PaymentsChart data={currentMonthDonut} />
            </div>

            {/* Recent payments feed */}
            <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <span className="text-xs font-semibold text-card-foreground">
                  Pagos de este mes
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Últimos 5
                </span>
              </div>
              <div className="flex-1 overflow-y-auto">
                <RecentPaymentsFeed
                  payments={recentPayments}
                  maxItems={5}
                />
              </div>
              <div className="border-t border-border px-3 py-2">
                <Link
                  href="/admin/pagos"
                  className="text-[11px] font-medium text-primary hover:underline"
                >
                  Ver historial completo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {cobroUser && selectedPago && (
        <ModalEditPayment
          pago={selectedPago}
          isOpen={!!cobroUser}
          onClose={handleCloseCobro}
          userId={cobroUser.id}
          todosLosPagosDelUsuario={pagosParaModal}
          userName={`${cobroUser.nombre} ${cobroUser.apellido}`}
          planNombre={cobroUser.tarifaNombre ?? null}
        />
      )}
    </div>
  );
}