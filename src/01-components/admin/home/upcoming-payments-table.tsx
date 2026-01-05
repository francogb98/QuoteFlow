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
  fechaVencimiento: Date | null;
  usuario: {
    nombre: string;
    apellido: string;
    documento: string;
  };
}

interface UpcomingPaymentsTableProps {
  pagos: Payment[];
}

export function UpcomingPaymentsTable({ pagos }: UpcomingPaymentsTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Documento</TableHead>
            <TableHead>Monto</TableHead>
            <TableHead>Vencimiento</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pagos.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center py-8 text-muted-foreground"
              >
                No hay próximos vencimientos
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
                  {pago.fechaVencimiento
                    ? format(new Date(pago.fechaVencimiento), "dd 'de' MMMM", {
                        locale: es,
                      })
                    : "-"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
