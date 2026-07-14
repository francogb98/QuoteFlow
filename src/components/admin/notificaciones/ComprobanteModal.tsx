"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2, CheckCircle, XCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getPagoUser } from "@/actions/admin/pago/getPagoUser";

interface ComprobanteModalProps {
  isOpen: boolean;
  onClose: () => void;
  pago: string;
}

// âš ï¸ Asegúrate de crear estas acciones del servidor
// import { aprobarPago, rechazarPago } from "@/actions/admin/pagos/pagos";

export function ComprobanteModal({
  isOpen,
  onClose,
  pago,
}: ComprobanteModalProps) {
  const [cargando, setCargando] = useState(false);

  const data = useQuery({
    queryKey: ["pago", pago],
    queryFn: ({ queryKey }) => getPagoUser(queryKey[1] as string),
  });

  const handleAprobar = async () => {
    setCargando(true);
    try {
      // Llama a la acción del servidor para aprobar el pago
      // const resultado = await aprobarPago(pago.id);
      // if (resultado.success) {
      //  toast.success("Comprobante aprobado con éxito.");
      //  onPagoActualizado();
      //  onClose();
      // } else {
      //  toast.error(resultado.error);
      // }
    } catch (error) {
      toast.error("Hubo un error al aprobar el comprobante.");
    } finally {
      setCargando(false);
    }
  };

  const handleRechazar = async () => {
    setCargando(true);
    try {
      // Llama a la acción del servidor para rechazar el pago
      // const resultado = await rechazarPago(pago.id);
      // if (resultado.success) {
      //  toast.success("Comprobante rechazado con éxito.");
      //  onPagoActualizado();
      //  onClose();
      // } else {
      //  toast.error(resultado.error);
      // }
    } catch (error) {
      toast.error("Hubo un error al rechazar el comprobante.");
    } finally {
      setCargando(false);
    }
  };

  if (data.isPending) {
    return <Loader2 className="mr-2 h-4 w-4 animate-spin" />;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {" "}
      <DialogContent className="sm:max-w-[425px]">
        {" "}
        <DialogHeader>
          {" "}
          <div className="flex items-center gap-2 text-blue-600">
            <FileText className="w-5 h-5" />{" "}
            <DialogTitle>Verificar Comprobante</DialogTitle>{" "}
          </div>{" "}
          <DialogDescription>
            Revisa el comprobante de pago y actualiza el estado.{" "}
          </DialogDescription>{" "}
        </DialogHeader>{" "}
        <div className="space-y-4 py-2">
          {" "}
          {data.isSuccess && data.data?.pago && (
            <div className="bg-gray-50 p-3 rounded-lg border">
              <h3 className="text-sm font-semibold mb-2">Detalles del Pago</h3>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Usuario:</span>{" "}
                {data.data.pago.usuario.nombre}{" "}
                {data.data.pago.usuario.apellido}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Monto:</span> $
                {data.data.pago.monto.toFixed(2)}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Fecha de Subida:</span>{" "}
                {format(new Date(data.data.pago.fecha), "dd/MM/yyyy HH:mm", {
                  locale: es,
                })}
              </p>
            </div>
          )}
          {data.isSuccess && data.data.pago && data.data.pago.comprobante ? (
            <div className="border rounded-md overflow-hidden">
              {" "}
              <Image
                src={data.data.pago.comprobante}
                alt="Comprobante de pago"
                width={400}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
          ) : (
            <p className="text-center text-gray-500 text-sm">
              No se encontró una imagen del comprobante.
            </p>
          )}{" "}
        </div>{" "}
        <DialogFooter className="gap-2 sm:gap-0 w-full">
          {" "}
          <Button
            variant="outline"
            onClick={handleRechazar}
            disabled={cargando}
          >
            {" "}
            {cargando ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="mr-2 h-4 w-4" />
            )}
            Rechazar{" "}
          </Button>{" "}
          <Button onClick={handleAprobar} disabled={cargando}>
            {" "}
            {cargando ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            Aprobar{" "}
          </Button>{" "}
        </DialogFooter>{" "}
      </DialogContent>{" "}
    </Dialog>
  );
}
