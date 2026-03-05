"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CalendarClock } from "lucide-react";
import { UpcomingDeadlineRow } from "@/lib/data/dashboardQueries";
import { useAdminPanelStore } from "@/lib/store/useAdminPanelStore"; // 1. Importar el store

interface UpcomingDeadlinesProps {
  deadlines: UpcomingDeadlineRow[];
}

function getInitials(nombre: string, apellido: string) {
  return `${nombre[0] ?? ""}${apellido[0] ?? ""}`.toUpperCase();
}

function getUrgencyStyle(days: number) {
  if (days <= 1) return "bg-red-100 text-red-700 border-red-200";
  if (days <= 3) return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-emerald-100 text-emerald-700 border-emerald-200";
}

export function UpcomingDeadlines({ deadlines }: UpcomingDeadlinesProps) {
  // 2. Obtener la función openUser del store
  const openUser = useAdminPanelStore((s) => s.openUser);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-card-foreground">
              Próximos Vencimientos
            </CardTitle>
            <CardDescription>Pagos por vencer esta semana</CardDescription>
          </div>
          <div className="rounded-lg bg-amber-100 p-2">
            <CalendarClock className="h-4 w-4 text-amber-600" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {deadlines.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No hay vencimientos próximos
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {deadlines.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors cursor-pointer"
                // 3. Usar el store para abrir el panel global
                onClick={() => item.usuarioId && openUser(item.usuarioId)}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-purple-500 text-[10px] font-bold text-white">
                    {getInitials(item.usuarioNombre, item.usuarioApellido)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-card-foreground truncate">
                    {item.usuarioNombre} {item.usuarioApellido}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    ${item.monto.toLocaleString("es-AR")}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-semibold ${getUrgencyStyle(item.diasRestantes)}`}
                >
                  {item.diasRestantes <= 0
                    ? "Hoy"
                    : item.diasRestantes === 1
                      ? "Mañana"
                      : `${item.diasRestantes} días`}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
