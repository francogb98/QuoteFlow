"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, CheckCircle, XCircle, Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { editPayment } from "@/01-actions/admin/pago/editPago";
import { getPagoUser } from "@/01-actions/admin/pago/getPagoUser";

interface ComprobanteModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  pagoId: string | null;
  onClose: () => void;
  onUpdate?: () => void;
}

export function ModalComprobante({
  isOpen,
  imageUrl,
  pagoId,
  onClose,
  onUpdate,
}: ComprobanteModalProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [estadoPago, setEstadoPago] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && pagoId) {
      setIsImageLoading(true);
      setShowRejectReason(false);
      setRejectionReason("");

      // Consultar el estado actual del pago para mostrarlo en el header
      const fetchEstado = async () => {
        const res = await getPagoUser(pagoId);
        if (res.ok) setEstadoPago(res.pago!.estado);
      };
      fetchEstado();
    }
  }, [isOpen, pagoId]);

  if (!isOpen) return null;

  const handleAction = async (status: "PAGADO" | "RECHAZADO") => {
    if (!pagoId) return;

    if (status === "RECHAZADO" && !rejectionReason.trim()) {
      toast.error("Por favor, ingresa un motivo para el rechazo");
      return;
    }

    setIsSubmitting(true);
    try {
      const motivoFinal =
        status === "PAGADO"
          ? "Su pago ha sido verificado y aprobado correctamente."
          : rejectionReason;

      const result = await editPayment({
        pagoId,
        newStatus: status,
        rejectionReason: motivoFinal,
      });

      if (result.ok) {
        toast.success(status === "PAGADO" ? "Pago aprobado" : "Pago rechazado");
        onUpdate?.();
        onClose();
      } else {
        toast.error(result.error || "Ocurrió un error");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Colores para el estado en el header
  const getBadgeVariant = (estado: string | null) => {
    switch (estado) {
      case "PAGADO":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "PENDIENTE":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "RECHAZADO":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con Estado */}
        <div className="p-4 border-b flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-gray-800">Comprobante de Pago</h3>
            {estadoPago && (
              <Badge
                variant="outline"
                className={`${getBadgeVariant(estadoPago)} font-bold`}
              >
                {estadoPago}
              </Badge>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Contenedor de Imagen (Ajustado para no tener scroll) */}
        <div className="flex-1 bg-gray-100 flex items-center justify-center overflow-hidden p-2 relative min-h-[300px]">
          {imageUrl && isImageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
            </div>
          )}

          {imageUrl ? (
            <div className="relative w-full h-full flex justify-center items-center">
              <Image
                src={imageUrl}
                alt="Comprobante"
                width={1500}
                height={1500}
                onLoadingComplete={() => setIsImageLoading(false)}
                className={`max-w-full max-h-[70vh] w-auto h-auto object-contain shadow-lg rounded-md transition-opacity duration-500 ${
                  isImageLoading ? "opacity-0" : "opacity-100"
                }`}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center text-gray-400">
              <Info className="w-12 h-12 mb-2 opacity-20" />
              <p>Imagen no disponible</p>
            </div>
          )}
        </div>

        {/* Sección de Motivo de Rechazo (Aparece solo si se intenta rechazar) */}
        {showRejectReason && (
          <div className="p-4 bg-red-50 border-t border-red-100 animate-in slide-in-from-bottom-2">
            <label className="text-xs font-bold text-red-700 uppercase mb-2 block">
              Especifique el motivo del rechazo:
            </label>
            <textarea
              autoFocus
              className="w-full p-3 border border-red-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500 bg-white"
              placeholder="Ej: El monto no coincide con la cuota actual..."
              rows={2}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t bg-white flex flex-col sm:flex-row gap-2 justify-end">
          {showRejectReason ? (
            <>
              <Button
                variant="ghost"
                onClick={() => setShowRejectReason(false)}
                disabled={isSubmitting}
              >
                Volver
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => handleAction("RECHAZADO")}
                disabled={isSubmitting || !rejectionReason.trim()}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                Confirmar Rechazo
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="text-gray-600 border-gray-200"
                onClick={() => setShowRejectReason(true)}
                disabled={isSubmitting || estadoPago === "RECHAZADO"}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Rechazar
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => handleAction("PAGADO")}
                disabled={isSubmitting || estadoPago === "PAGADO"}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                {estadoPago === "PAGADO" ? "Ya Aprobado" : "Aprobar Pago"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
