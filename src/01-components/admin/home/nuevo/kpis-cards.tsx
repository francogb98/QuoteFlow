"use client";

import { Users, DollarSign, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { KpiData, PaymentDetailRow } from "@/lib/data/dashboardQueries"; // Asegúrate de importar el tipo nuevo
import { useState } from "react";

// Extendemos las props para recibir las listas
interface KpiCardsProps {
  data: KpiData;
  pagosPagados: PaymentDetailRow[];
  pagosPendientes: PaymentDetailRow[];
  pagosVencidos: PaymentDetailRow[];
}

export function KpiCards({
  data,
  pagosPagados,
  pagosPendientes,
  pagosVencidos,
}: KpiCardsProps) {
  // Estado para controlar el modal
  // Puede ser 'pagados' | 'pendientes' | 'vencidos' | null
  const [modalOpen, setModalOpen] = useState<string | null>(null);

  // Determinar qué lista mostrar basado en el estado
  const getActiveList = () => {
    switch (modalOpen) {
      case "pagados":
        return pagosPagados;
      case "pendientes":
        return pagosPendientes;
      case "vencidos":
        return pagosVencidos;
      default:
        return [];
    }
  };

  const activeList = getActiveList();

  const kpiItems = [
    {
      key: null, // No clickeable
      title: "Total Usuarios",
      value: data.totalUsuarios.toString(),
      subtitle: `${data.usuariosActivos} activos`,
      icon: Users,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      key: "pagados", // Identificador para el modal
      title: "Recaudado del Mes",
      value: `$${data.totalRecaudado.toLocaleString("es-AR")}`,
      subtitle: "este periodo",
      icon: DollarSign,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      key: "pendientes",
      title: "Pagos Pendientes",
      value: data.pagosPendientes.toString(),
      subtitle: "por cobrar",
      icon: Clock,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      key: "vencidos",
      title: "Pagos Vencidos",
      value: data.pagosVencidos.toString(),
      subtitle: "requieren atencion",
      icon: AlertTriangle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
  ];

  const formatCurrency = (value: number) => `$${value.toLocaleString("es-AR")}`;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
    });
  };

  const getModalTitle = () => {
    switch (modalOpen) {
      case "pagados":
        return "Detalles de Pagos Recaudados";
      case "pendientes":
        return "Detalles de Pagos Pendientes";
      case "vencidos":
        return "Detalles de Pagos Vencidos";
      default:
        return "";
    }
  };

  return (
    <>
      {/* Grid de KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiItems.map((kpi) => {
          const Icon = kpi.icon;
          const isClickable = kpi.key !== null;

          return (
            <Card
              key={kpi.title}
              className={`relative overflow-hidden transition-all ${
                isClickable
                  ? "cursor-pointer hover:border-primary hover:shadow-md"
                  : ""
              }`}
              onClick={() => isClickable && setModalOpen(kpi.key)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {kpi.title}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-card-foreground">
                      {kpi.value}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">
                        {kpi.subtitle}
                      </span>
                    </div>
                  </div>
                  <div className={`rounded-xl p-2.5 ${kpi.iconBg}`}>
                    <Icon className={`h-5 w-5 ${kpi.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal de Detalles */}
      <Dialog open={!!modalOpen} onOpenChange={() => setModalOpen(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{getModalTitle()}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            {activeList.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No hay datos para mostrar.
              </div>
            ) : (
              <div className="space-y-3">
                {activeList.map((pago) => (
                  <div
                    key={pago.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex-1">
                      <p className="font-medium">
                        {pago.usuarioNombre} {pago.usuarioApellido}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {modalOpen === "pagados"
                          ? `Pagado: ${formatDate(pago.fechaPago)}`
                          : `Vence: ${formatDate(pago.fechaVencimiento)}`}
                      </p>
                    </div>
                    <div
                      className={`text-lg font-bold ${
                        modalOpen === "pagados"
                          ? "text-green-600"
                          : modalOpen === "vencidos"
                            ? "text-red-600"
                            : "text-amber-600"
                      }`}
                    >
                      {formatCurrency(pago.monto)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
