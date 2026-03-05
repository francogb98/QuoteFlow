"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UsersOverviewData } from "@/lib/data/dashboardQueries";

interface UsersOverviewProps {
  data: UsersOverviewData;
}

export function UsersOverview({ data }: UsersOverviewProps) {
  const activosPct =
    data.total > 0 ? Math.round((data.activos / data.total) * 100) : 0;
  const inactivosPct =
    data.total > 0 ? Math.round((data.inactivos / data.total) * 100) : 0;

  const tasaCobro =
    data.totalActivosParaPago > 0
      ? ((data.pagaronEsteMes / data.totalActivosParaPago) * 100).toFixed(1)
      : "0.0";

  const userStats = [
    {
      label: "Activos",
      count: data.activos,
      pct: activosPct,
      color: "bg-emerald-500",
      textColor: "text-emerald-600",
    },
    {
      label: "Inactivos",
      count: data.inactivos,
      pct: inactivosPct,
      color: "bg-gray-400",
      textColor: "text-gray-500",
    },
  ];

  const paymentSummary = [
    {
      label: "Pagaron este mes",
      count: data.pagaronEsteMes,
      color: "bg-emerald-500",
    },
    {
      label: "Pendientes",
      count: data.pendientesEsteMes,
      color: "bg-amber-500",
    },
    {
      label: "Vencidos",
      count: data.vencidosEsteMes,
      color: "bg-red-500",
    },
    {
      label: "Sin generar",
      count: data.sinGenerar,
      color: "bg-gray-300",
    },
  ];

  const now = new Date();
  const mesNombre = now.toLocaleDateString("es-AR", { month: "long" });
  const año = now.getFullYear();
  const periodoLabel = `${mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1)} ${año}`;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-card-foreground">
          Estado de Usuarios
        </CardTitle>
        <CardDescription>Resumen de actividad de miembros</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {/* User status */}
        <div className="flex flex-col gap-3">
          {userStats.map((stat) => (
            <div key={stat.label}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {stat.label}
                </span>
                <span className={`text-xs font-bold ${stat.textColor}`}>
                  {stat.count}{" "}
                  <span className="font-normal text-muted-foreground">
                    ({stat.pct}%)
                  </span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${stat.color} transition-all duration-500`}
                  style={{ width: `${stat.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="my-4 h-px bg-border" />

        {/* Payment completion */}
        <p className="mb-3 text-xs font-semibold text-card-foreground">
          Pagos {periodoLabel}
        </p>
        <div className="flex flex-col gap-2.5">
          {paymentSummary.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div
                className={`h-2 w-2 flex-shrink-0 rounded-full ${item.color}`}
              />
              <span className="flex-1 text-xs text-muted-foreground">
                {item.label}
              </span>
              <span className="text-xs font-semibold text-card-foreground">
                {item.count}
              </span>
            </div>
          ))}
        </div>

        {/* Completion bar */}
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              Tasa de cobro
            </span>
            <span className="text-xs font-bold text-emerald-600">
              {tasaCobro}%
            </span>
          </div>
          <Progress
            value={parseFloat(tasaCobro)}
            className="h-2.5 bg-muted [&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-purple-500"
          />
        </div>
      </CardContent>
    </Card>
  );
}
