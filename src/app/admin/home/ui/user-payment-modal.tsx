"use client";

import { useEffect, useState } from "react";
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

import { Button } from "@/components/ui/button";
import { updatePago } from "./update-pago";
import { toast } from "sonner";

interface Pago {
  id: string;
  mes: string;
  monto: number;
  estado: "PAGADO" | "PENDIENTE" | "VENCIDO" | "RECHAZADO";
  metodo: "EFECTIVO" | "MERCADOPAGO" | "TRANSFERENCIA" | "TARJETA";
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
  RECHAZADO: "text-gray-500",
};

export function UserPaymentsModal({
  open,
  onOpenChange,
  usuarioNombre,
  pagos,
}: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [estados, setEstados] = useState<Record<string, Pago["estado"]>>({});
  const [metodos, setMetodos] = useState<Record<string, Pago["metodo"]>>({});

  const handleSave = async (pago: Pago) => {
    const estado = estados[pago.id] ?? pago.estado;
    const metodo = metodos[pago.id] ?? pago.metodo;

    try {
      setLoadingId(pago.id);

      await updatePago(pago.id, {
        estado,
        metodo,
      });

      toast.success("Pago actualizado correctamente");
    } catch (error) {
      toast.error("Error al actualizar el pago");
    } finally {
      setLoadingId(null);
    }
  };

  useEffect(() => {}, [estados, metodos]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Pagos de {usuarioNombre}</DialogTitle>
        </DialogHeader>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mes</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Método</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {pagos.map((pago) => (
              <TableRow key={pago.id}>
                <TableCell>{pago.mes}</TableCell>

                <TableCell>${pago.monto.toLocaleString()}</TableCell>

                <TableCell>
                  <select
                    className={`border rounded p-1 ${estadoStyles[pago.estado]}`}
                    defaultValue={pago.estado}
                    onChange={(e) =>
                      setEstados({
                        ...estados,
                        [pago.id]: e.target.value as Pago["estado"],
                      })
                    }
                  >
                    <option value="PAGADO">PAGADO</option>
                    <option value="PENDIENTE">PENDIENTE</option>
                    <option value="VENCIDO">VENCIDO</option>
                    <option value="RECHAZADO">RECHAZADO</option>
                  </select>
                </TableCell>

                <TableCell>
                  <select
                    className="border rounded p-1"
                    defaultValue={pago.metodo}
                    onChange={(e) =>
                      setMetodos({
                        ...metodos,
                        [pago.id]: e.target.value as Pago["metodo"],
                      })
                    }
                  >
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="MERCADOPAGO">MercadoPago</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                    <option value="TARJETA">Tarjeta</option>
                  </select>
                </TableCell>

                <TableCell>
                  <Button
                    size="sm"
                    disabled={loadingId === pago.id}
                    onClick={() => handleSave(pago)}
                  >
                    {loadingId === pago.id ? "Guardando..." : "Guardar"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
