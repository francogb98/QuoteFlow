"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { PaymentMethodData } from "@/lib/data/dashboardQueries";

interface PaymentMethodsChartProps {
  data: PaymentMethodData[];
}

export function PaymentMethodsChart({ data }: PaymentMethodsChartProps) {
  const total = data.reduce((acc, item) => acc + item.value, 0);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-card-foreground">
            Metodos de Pago
          </CardTitle>
          <CardDescription>Distribucion de pagos del mes</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">
            Sin pagos registrados este mes
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-card-foreground">
          Metodos de Pago
        </CardTitle>
        <CardDescription>Distribucion de pagos del mes</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer
          config={Object.fromEntries(
            data.map((d) => [
              d.name.toLowerCase(),
              { label: d.name, color: d.color },
            ]),
          )}
          className="mx-auto h-[180px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value} pagos (${total > 0 ? ((value / total) * 100).toFixed(0) : 0}%)`,
                  name,
                ]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  fontSize: "13px",
                }}
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                strokeWidth={2}
                stroke="#fff"
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {data.map((method) => (
            <div key={method.name} className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: method.color }}
              />
              <span className="text-xs text-muted-foreground">
                {method.name}
              </span>
              <span className="ml-auto text-xs font-semibold text-card-foreground">
                {method.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
