"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ChartContainer } from "@/components/ui/chart";

export interface CurrentMonthDonutData {
  pagados: number;
  pendientes: number;
  vencidos: number;
}

interface PaymentsChartProps {
  data: CurrentMonthDonutData;
}

const SEGMENTS = [
  { key: "pagados", label: "Pagados", color: "#10b981" },
  { key: "pendientes", label: "Pendientes", color: "#f59e0b" },
  { key: "vencidos", label: "Vencidos", color: "#ef4444" },
] as const;

export function PaymentsChart({ data }: PaymentsChartProps) {
  const chartData = SEGMENTS.map((s) => ({
    name: s.label,
    value: data[s.key],
    color: s.color,
  }));

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center">
        <p className="text-xs text-muted-foreground">
          Sin datos del mes actual
        </p>
      </div>
    );
  }

  return (
    <div className="px-3 py-2">
      <ChartContainer
        config={{
          pagados: { label: "Pagados", color: "#10b981" },
          pendientes: { label: "Pendientes", color: "#f59e0b" },
          vencidos: { label: "Vencidos", color: "#ef4444" },
        }}
        className="mx-auto h-[180px] w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(value: number, name: string) => [
                `${value} usuarios (${total > 0 ? ((value / total) * 100).toFixed(0) : 0}%)`,
                name,
              ]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "12px",
              }}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              strokeWidth={2}
              stroke="#fff"
              startAngle={90}
              endAngle={-270}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            {/* Center label rendered as HTML overlay */}
            <foreignObject
              x="50%"
              y="50%"
              width="1"
              height="1"
              style={{ overflow: "visible" }}
            >
              <div
                style={{
                  position: "absolute",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "var(--foreground, #0f172a)",
                    lineHeight: 1.1,
                  }}
                >
                  {total}
                </div>
                <div
                  style={{
                    fontSize: "9px",
                    color: "var(--muted-foreground, #64748b)",
                    marginTop: "1px",
                  }}
                >
                  usuarios
                </div>
              </div>
            </foreignObject>
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Legend */}
      <div className="mt-2 flex items-center justify-center gap-4">
        {SEGMENTS.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-[10px] text-muted-foreground">
              {s.label}
            </span>
            <span className="text-[10px] font-semibold text-card-foreground">
              {data[s.key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}