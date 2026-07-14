"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Edit, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editPayment } from "@/actions/admin/pago/editPago";


interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  pagoId: string;
  userName: string;
}

export const EditPaymentStatusModal = ({
  isOpen,
  onOpenChange,
  pagoId,
  userName,
}: Props) => {
  const queryClient = useQueryClient();
  const [newStatus, setNewStatus] = useState<"PAGADO" | "RECHAZADO">("PAGADO");
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: editPayment,
    onSuccess: (data) => {
      if (data.ok) {
        // Invalida la caché para que el componente PagosGrid se actualice automáticamente
        queryClient.invalidateQueries({ queryKey: ["pagos"] });
        onOpenChange(false);
      } else {
        //@ts-ignore
        setError(data.error);
      }
    },
    onError: () => {
      setError("Error inesperado. Intente nuevamente.");
    },
  });

  const handleSave = () => {
    if (newStatus === "RECHAZADO" && !rejectionReason.trim()) {
      setError("Debe proporcionar un motivo para el rechazo.");
      return;
    }
    setError(null);
    mutate({ pagoId, newStatus, rejectionReason });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-xl shadow-lg p-6 bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            <div className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-purple-600" />
              Editar Estado de Pago
            </div>
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Actualiza el estado del pago para {userName}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {error && (
            <div className="bg-red-50 p-2 rounded-md text-sm text-red-600">
              {error}
            </div>
          )}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setNewStatus("PAGADO")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold transition-colors border
                ${
                  newStatus === "PAGADO"
                    ? "bg-green-100 text-green-700 border-green-200"
                    : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                }
              `}
            >
              <CheckCircle className="w-4 h-4" />
              Verificado
            </button>
            <button
              onClick={() => setNewStatus("RECHAZADO")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold transition-colors border
                ${
                  newStatus === "RECHAZADO"
                    ? "bg-red-100 text-red-700 border-red-200"
                    : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                }
              `}
            >
              <XCircle className="w-4 h-4" />
              Rechazado
            </button>
          </div>
          {newStatus === "RECHAZADO" && (
            <div className="space-y-2">
              <label
                htmlFor="reason"
                className="text-sm font-medium text-gray-700"
              >
                Motivo del rechazo
              </label>
              <textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                placeholder="Ej. El comprobante no es legible o corresponde a otra transacción."
              />
            </div>
          )}
        </div>
        <DialogFooter className="flex justify-end gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className={`px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold transition-colors flex items-center gap-2 justify-center
              ${isPending ? "opacity-50 cursor-not-allowed" : "hover:bg-purple-700"}
            `}
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isPending ? "Guardando..." : "Guardar Cambios"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
