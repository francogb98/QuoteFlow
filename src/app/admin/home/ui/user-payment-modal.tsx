"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Pago {
  mes: string;
  estado: "PAGADO" | "PENDIENTE" | "VENCIDO";
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuarioNombre: string;
  pagos: Pago[];
}

const estadoStyles = {
  PAGADO: "text-emerald-600",
  PENDIENTE: "text-yellow-600",
  VENCIDO: "text-red-600",
};

export function UserPaymentsModal({
  open,
  onOpenChange,
  usuarioNombre,
  pagos,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pagos de {usuarioNombre}</DialogTitle>
        </DialogHeader>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mes</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {pagos.map((pago, i) => (
              <TableRow key={i}>
                <TableCell>{pago.mes}</TableCell>

                <TableCell className={estadoStyles[pago.estado]}>
                  {pago.estado}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
