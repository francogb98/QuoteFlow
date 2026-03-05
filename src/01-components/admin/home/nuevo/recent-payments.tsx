"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RecentPaymentRow } from "@/lib/data/dashboardQueries";
import { useAdminPanelStore } from "@/lib/store/useAdminPanelStore";

interface RecentPaymentsProps {
  payments: RecentPaymentRow[];
}

const estadoStyles: Record<string, string> = {
  PAGADO: "bg-emerald-100 text-emerald-700 border-emerald-200",
  PENDIENTE: "bg-amber-100 text-amber-700 border-amber-200",
  VENCIDO: "bg-red-100 text-red-700 border-red-200",
  RECHAZADO: "bg-gray-100 text-gray-700 border-gray-200",
};

const estadoLabels: Record<string, string> = {
  PAGADO: "Pagado",
  PENDIENTE: "Pendiente",
  VENCIDO: "Vencido",
  RECHAZADO: "Rechazado",
};

const metodoLabels: Record<string, string> = {
  EFECTIVO: "Efectivo",
  MERCADOPAGO: "MercadoPago",
  TRANSFERENCIA: "Transferencia",
  TARJETA: "Tarjeta",
};

function getInitials(nombre: string, apellido: string) {
  return `${nombre[0] ?? ""}${apellido[0] ?? ""}`.toUpperCase();
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
  });
}

export function RecentPayments({ payments }: RecentPaymentsProps) {
  const openUser = useAdminPanelStore((s) => s.openUser);

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-card-foreground">
              Pagos Recientes
            </CardTitle>
            <CardDescription>
              Últimos movimientos de tus usuarios
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {payments.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No hay pagos recientes
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">Usuario</TableHead>
                <TableHead className="text-xs">Monto</TableHead>
                <TableHead className="text-xs">Estado</TableHead>
                <TableHead className="text-xs hidden sm:table-cell">
                  Método
                </TableHead>
                <TableHead className="text-xs hidden md:table-cell">
                  Período
                </TableHead>
                <TableHead className="text-xs text-right">Fecha</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-purple-500 text-[10px] font-bold text-white">
                          {getInitials(
                            payment.usuarioNombre,
                            payment.usuarioApellido,
                          )}
                        </AvatarFallback>
                      </Avatar>

                      <button
                        type="button"
                        onClick={() => {
                          console.log("entre aqui");
                          console.log(payment);
                          console.log(
                            payment.usuarioId && openUser(payment.usuarioId),
                          );
                          payment.usuarioId && openUser(payment.usuarioId);
                        }}
                        className="text-sm font-medium text-card-foreground hover:opacity-80 text-left"
                      >
                        {payment.usuarioNombre} {payment.usuarioApellido} SS
                      </button>
                    </div>
                  </TableCell>

                  <TableCell className="py-3">
                    <span className="text-sm font-semibold text-card-foreground">
                      ${payment.monto.toLocaleString("es-AR")}
                    </span>
                  </TableCell>

                  <TableCell className="py-3">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-semibold ${
                        estadoStyles[payment.estado] ?? ""
                      }`}
                    >
                      {estadoLabels[payment.estado] ?? payment.estado}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-3 hidden sm:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {metodoLabels[payment.metodo] ?? payment.metodo}
                    </span>
                  </TableCell>

                  <TableCell className="py-3 hidden md:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {payment.periodo}
                    </span>
                  </TableCell>

                  <TableCell className="py-3 text-right">
                    <span className="text-sm text-muted-foreground">
                      {formatDate(payment.fecha)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
