"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ImageIcon,
  XCircle,
  Bell,
  MessageCircle,
} from "lucide-react";
import { NotificationRow } from "@/lib/data/dashboardQueries";

interface NotificationsPanelProps {
  notifications: NotificationRow[];
}

type NotificationType =
  | "PAGO_VENCIDO"
  | "PAGO_PROXIMO_VENCER"
  | "COMPROBANTE_SUBIDO"
  | "COMPROBANTE_APROBADO"
  | "COMPROBANTE_RECHAZADO"
  | "PAGO_CONFIRMADO"
  | "RECORDATORIO_PAGO"
  | "SISTEMA";

const iconMap: Record<
  NotificationType,
  { icon: typeof AlertTriangle; bg: string; color: string }
> = {
  PAGO_VENCIDO: {
    icon: AlertTriangle,
    bg: "bg-red-100",
    color: "text-red-600",
  },
  PAGO_PROXIMO_VENCER: {
    icon: Clock,
    bg: "bg-amber-100",
    color: "text-amber-600",
  },
  COMPROBANTE_SUBIDO: {
    icon: ImageIcon,
    bg: "bg-blue-100",
    color: "text-blue-600",
  },
  COMPROBANTE_APROBADO: {
    icon: CheckCircle2,
    bg: "bg-emerald-100",
    color: "text-emerald-600",
  },
  COMPROBANTE_RECHAZADO: {
    icon: XCircle,
    bg: "bg-gray-100",
    color: "text-gray-600",
  },
  PAGO_CONFIRMADO: {
    icon: CheckCircle2,
    bg: "bg-emerald-100",
    color: "text-emerald-600",
  },
  RECORDATORIO_PAGO: {
    icon: MessageCircle,
    bg: "bg-blue-100",
    color: "text-blue-600",
  },
  SISTEMA: {
    icon: Bell,
    bg: "bg-purple-100",
    color: "text-purple-600",
  },
};

function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Hace minutos";
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays === 1) return "Ayer";
  return `Hace ${diffDays} dias`;
}

export function NotificationsPanel({ notifications }: NotificationsPanelProps) {
  const unreadCount = notifications.filter((n) => !n.leida).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-card-foreground">
              Notificaciones
            </CardTitle>
            <CardDescription>{unreadCount} sin leer</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {notifications.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No hay notificaciones
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {notifications.map((notif) => {
              const style =
                iconMap[notif.tipo as NotificationType] ?? iconMap.SISTEMA;
              const Icon = style.icon;

              return (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 rounded-lg p-2.5 transition-colors ${
                    !notif.leida ? "bg-emerald-50/60" : "hover:bg-muted/50"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex-shrink-0 rounded-lg p-1.5 ${style.bg}`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${style.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-card-foreground truncate">
                        {notif.titulo}
                      </p>
                      {!notif.leida && (
                        <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
                      {notif.mensaje}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground/70">
                      {timeAgo(notif.fechaCreacion)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
