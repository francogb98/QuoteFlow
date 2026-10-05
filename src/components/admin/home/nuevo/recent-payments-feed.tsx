"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RecentPaymentRow } from "@/lib/data/dashboardQueries";
import { useAdminPanelStore } from "@/lib/store/useAdminPanelStore";
import { Clock, DollarSign } from "lucide-react";

interface RecentPaymentsFeedProps {
  payments: RecentPaymentRow[];
  maxItems?: number;
}

const estadoDotColor: Record<string, string> = {
  PAGADO: "bg-emerald-500",
  PENDIENTE: "bg-amber-500",
  VENCIDO: "bg-red-500",
  RECHAZADO: "bg-gray-400",
};

function getInitials(nombre: string, apellido: string) {
  return `${nombre[0] ?? ""}${apellido[0] ?? ""}`.toUpperCase();
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHs / 24);

  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffHs < 24) return `Hace ${diffHs}h`;
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;

  return date.toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
}

export function RecentPaymentsFeed({
  payments,
  maxItems = 5,
}: RecentPaymentsFeedProps) {
  const openUser = useAdminPanelStore((s) => s.openUser);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthPayments = payments.filter((p) => {
    const date = new Date(p.fecha);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const visiblePayments = currentMonthPayments.slice(0, maxItems);

  if (visiblePayments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <DollarSign className="mb-2 h-8 w-8 text-muted-foreground/40" />
        <p className="text-xs text-muted-foreground">Sin pagos este mes</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      {visiblePayments.map((payment) => (
        <button
          key={payment.id}
          type="button"
          onClick={() => payment.usuarioId && openUser(payment.usuarioId)}
          className="flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
        >
          <div className="relative">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-primary text-[9px] font-bold text-white">
                {getInitials(payment.usuarioNombre, payment.usuarioApellido)}
              </AvatarFallback>
            </Avatar>
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ring-1 ring-card ${estadoDotColor[payment.estado] ?? "bg-gray-400"}`}
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-foreground">
              {payment.usuarioNombre} {payment.usuarioApellido}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="h-2.5 w-2.5" />
              <span>{formatRelativeTime(payment.fecha)}</span>
            </div>
          </div>

          <span className="shrink-0 text-xs font-semibold text-emerald-600">
            ${payment.monto.toLocaleString("es-AR")}
          </span>
        </button>
      ))}
    </div>
  );
}