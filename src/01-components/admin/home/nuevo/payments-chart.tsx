"use client";

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { MonthlyChartData } from "@/lib/data/dashboardQueries";

interface PaymentsChartProps {
  data: MonthlyChartData[];
}

export function PaymentsChart({ data }: PaymentsChartProps) {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-card-foreground">
          Recaudacion Mensual
        </CardTitle>
        <CardDescription>
          Ultimos 6 meses de actividad de cobros
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer
          config={{
            pagados: {
              label: "Pagados",
              color: "#10b981",
            },
            pendientes: {
              label: "Pendientes",
              color: "#f59e0b",
            },
            vencidos: {
              label: "Vencidos",
              color: "#ef4444",
            },
          }}
          className="h-[280px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
            >
              <XAxis
                dataKey="mes"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: number) => [
                  `$${value.toLocaleString("es-AR")}`,
                  "",
                ]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  fontSize: "13px",
                }}
              />
              <Bar
                dataKey="pagados"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                name="Pagados"
              />
              <Bar
                dataKey="pendientes"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
                name="Pendientes"
              />
              <Bar
                dataKey="vencidos"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
                name="Vencidos"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-3 flex items-center justify-center gap-5">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-muted-foreground">Pagados</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span className="text-xs text-muted-foreground">Pendientes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
            <span className="text-xs text-muted-foreground">Vencidos</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
