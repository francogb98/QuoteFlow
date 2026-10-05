"use client";

import { DollarSign, Edit, Eye } from "lucide-react";
import { useState } from "react";
import type { SerializedPago } from "@/types/usuarios";
import { ModalComprobante } from "@/components/admin/ui/ModalComprobante";

interface PagosGridProps {
  pagos: any[];
  id: string;
  configuracionTarifa?: any;
  fechaInicioMembresia?: Date;
  onCreatePayment?: () => void;
  onEditPayment?: (pago: SerializedPago) => void;
}

export const PagosGrid = ({
  pagos,
  id,
  configuracionTarifa,
  fechaInicioMembresia,
  onCreatePayment,
  onEditPayment,
}: PagosGridProps) => {
  const [isComprobanteOpen, setIsComprobanteOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<SerializedPago | null>(null);

  const handleViewComprobante = (pago: SerializedPago) => {
    setSelectedPayment(pago);
    setIsComprobanteOpen(true);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Historial
        </h3>
        <button
          onClick={() => onCreatePayment?.()}
          className="text-[11px] bg-purple-600 text-white px-2.5 py-1 rounded-md hover:bg-purple-700 font-semibold"
        >
          + Nuevo Pago
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
        {pagos?.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {pagos.map((pago: any) => (
              <div
                key={pago.id}
                className="px-3 py-2 flex items-center justify-between hover:bg-gray-50 group"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      pago.estado === "PAGADO"
                        ? "bg-green-100 text-green-600"
                        : "bg-amber-100 text-amber-600"
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-gray-900">
                        ${pago.monto.toFixed(0)}
                      </p>
                      <span className="text-[9px] text-gray-400 uppercase">
                        {pago.metodo}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400">
                      {pago.mes}/{pago.año}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-0.5">
                  {pago.comprobante && (
                    <button
                      onClick={() => handleViewComprobante(pago)}
                      className="p-1.5 text-blue-500 rounded opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-50"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => onEditPayment?.(pago)}
                    className="p-1.5 text-purple-500 rounded opacity-0 group-hover:opacity-100 transition-all hover:bg-purple-50"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-gray-400 text-xs">
            Sin pagos registrados.
          </div>
        )}
      </div>

      <ModalComprobante
        isOpen={isComprobanteOpen}
        pagoId={selectedPayment?.id || null}
        imageUrl={selectedPayment?.comprobante || null}
        onClose={() => setIsComprobanteOpen(false)}
        onUpdate={() => setIsComprobanteOpen(false)}
      />
    </div>
  );
};