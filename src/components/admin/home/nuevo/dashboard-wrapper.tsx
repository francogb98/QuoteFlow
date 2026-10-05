"use client";

import { MonthSelector } from "./month-selector";
import { DashboardContent } from "./dashboard-content";
import { KpiData, RecentPaymentRow, UserRow, UsersOverviewData } from "@/lib/data/dashboardQueries";

interface DashboardWrapperProps {
  adminNombre: string;
  saludo: string;
  mesNombre: string;
  año: number;
  isFilteredMonth: boolean;
  kpis: KpiData;
  users: UserRow[];
  recentPayments: RecentPaymentRow[];
  usersOverview: UsersOverviewData;
}

export function DashboardWrapper({
  adminNombre,
  saludo,
  mesNombre,
  año,
  kpis,
  users,
  recentPayments,
  usersOverview,
}: DashboardWrapperProps) {
  return (
    <>
      <div className="mb-2 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">
              {saludo}{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-primary bg-clip-text text-transparent">
                {adminNombre}
              </span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Resumen de tu negocio de{" "}
              <span className="font-bold">
                {mesNombre} {año}
              </span>
            </p>
          </div>
          <MonthSelector />
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <DashboardContent
          kpis={kpis}
          users={users}
          recentPayments={recentPayments}
          usersOverview={usersOverview}
        />
      </div>
    </>
  );
}