"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { getAnalytics } from "@/actions/admin/analitycs/get-analitycs";

interface PaymentData {
  mes: number;
  nombreMes: string;
  año: number;
  totalPagos: number;
  montoTotal: number;
  pagosPagados: number;
  pagosPendientes: number;
  pagosVencidos: number;
  pagosRechazados: number;
}

interface GeneralStats {
  totalPagosHistoricos: number;
  montoTotalHistorico: number;
  pagosPagadosHistorico: number;
  pagosPendientesHistorico: number;
  pagosVencidosHistorico: number;
  pagosRechazadosHistorico: number;
}

interface AnalyticsData {
  pagosPorMes: PaymentData[];
  estadisticasGenerales: GeneralStats;
}

const COLORS = {
  aceptado: "hsl(var(--chart-1))",
  pendiente: "hsl(var(--chart-2))",
  vencido: "hsl(var(--chart-3))",
  rechazado: "hsl(var(--chart-4))",
};

export default function PaymentAnalyticsDashboard({
  administradorId,
}: {
  administradorId: string;
}) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [administradorId]);

  const fetchAnalytics = async () => {
    startTransition(async () => {
      try {
        setError(null);
        const analyticsData = await getAnalytics();
        setData(analyticsData);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        setError("Error al cargar las estadísticas");
      }
    });
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const chartConfig = {
    totalPagos: {
      label: "Total Pagos",
      color: "hsl(var(--chart-1))",
    },
    montoTotal: {
      label: "Monto Total",
      color: "hsl(var(--chart-2))",
    },
    pagosPagados: {
      label: "Aceptados",
      color: COLORS.aceptado,
    },
    pagosPendientes: {
      label: "Pendientes",
      color: COLORS.pendiente,
    },
    pagosVencidos: {
      label: "Vencidos",
      color: COLORS.vencido,
    },
    pagosRechazados: {
      label: "Rechazados",
      color: COLORS.rechazado,
    },
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Estadísticas Históricas de Pagos
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Análisis de pagos desde la creación de la empresa
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              Pagos Aceptados por Mes
            </CardTitle>
            <CardDescription>
              Cantidad de pagos recibidos exitosamente cada mes
            </CardDescription>
          </CardHeader>
          <CardContent className="w-full">
            <ChartContainer
              config={chartConfig}
              className="h-[350px] sm:h-[400px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.pagosPorMes} margin={{ bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="nombreMes"
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="pagosPagados"
                    fill="var(--color-pagosPagados)"
                    radius={4}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              Ingresos Recibidos por Mes
            </CardTitle>
            <CardDescription>Monto de pagos aceptados cada mes</CardDescription>
          </CardHeader>
          <CardContent className="w-full">
            <ChartContainer
              config={chartConfig}
              className="h-[350px] sm:h-[400px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.pagosPorMes} margin={{ bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="nombreMes"
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value) => [
                      `$${Number(value).toLocaleString()}`,
                      "Monto Recibido",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="montoTotal"
                    stroke="var(--color-montoTotal)"
                    strokeWidth={3}
                    dot={{
                      fill: "var(--color-montoTotal)",
                      strokeWidth: 2,
                      r: 4,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            Resumen Mensual Detallado
          </CardTitle>
          <CardDescription>
            Vista detallada de pagos recibidos y pendientes por mes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Mes</th>
                  <th className="text-right p-2 hidden sm:table-cell">Total</th>
                  <th className="text-right p-2">Monto</th>
                  <th className="text-center p-2">Aceptados</th>
                  <th className="text-center p-2">Pendientes</th>
                  <th className="text-center p-2 hidden md:table-cell">
                    Vencidos
                  </th>
                  <th className="text-center p-2 hidden md:table-cell">
                    Rechazados
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.pagosPorMes.map((mes) => (
                  <tr
                    key={`${mes.año}-${mes.mes}`}
                    className="border-b hover:bg-muted/50"
                  >
                    <td className="p-2 font-medium capitalize">
                      {mes.nombreMes} {mes.año}
                    </td>
                    <td className="text-right p-2 hidden sm:table-cell">
                      {mes.totalPagos}
                    </td>
                    <td className="text-right p-2 text-xs sm:text-sm">
                      ${mes.montoTotal.toLocaleString()}
                    </td>
                    <td className="text-center p-2">
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        {mes.pagosPagados}
                      </Badge>
                    </td>
                    <td className="text-center p-2">
                      <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                        {mes.pagosPendientes}
                      </Badge>
                    </td>
                    <td className="text-center p-2 hidden md:table-cell">
                      <Badge className="bg-red-100 text-red-800 text-xs">
                        {mes.pagosVencidos}
                      </Badge>
                    </td>
                    <td className="text-center p-2 hidden md:table-cell">
                      <Badge className="bg-gray-100 text-gray-800 text-xs">
                        {mes.pagosRechazados}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
