import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Payment {
  id: string;
  monto: number;
  fecha: Date;
  estado: "PAGADO" | "PENDIENTE" | "VENCIDO" | "RECHAZADO";
  usuario: {
    nombre: string;
    apellido: string;
    documento: string;
  };
}

interface RecentPaymentsTableProps {
  pagos: Payment[];
}

export function RecentPaymentsTable({ pagos }: RecentPaymentsTableProps) {
  const statusColors = {
    PAGADO: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    PENDIENTE:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    VENCIDO: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    RECHAZADO: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  };

  const statusLabels = {
    PAGADO: "Pagado",
    PENDIENTE: "Pendiente",
    VENCIDO: "Vencido",
    RECHAZADO: "Rechazado",
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Documento</TableHead>
            <TableHead>Monto</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pagos.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-8 text-muted-foreground"
              >
                No hay pagos registrados
              </TableCell>
            </TableRow>
          ) : (
            pagos.map((pago) => (
              <TableRow key={pago.id}>
                <TableCell className="font-medium">
                  {pago.usuario.nombre} {pago.usuario.apellido}
                </TableCell>
                <TableCell>{pago.usuario.documento}</TableCell>
                <TableCell>${pago.monto.toFixed(2)}</TableCell>
                <TableCell>
                  {format(new Date(pago.fecha), "dd 'de' MMMM, HH:mm", {
                    locale: es,
                  })}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-block rounded px-3 py-1 text-sm font-medium ${statusColors[pago.estado]}`}
                  >
                    {statusLabels[pago.estado]}
                  </span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
