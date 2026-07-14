"use client";

import { DollarSign, Edit, Eye } from "lucide-react";
import { useState } from "react";
import { TipoConfiguracionTarifa } from "@prisma/client";
import type { SerializedPago } from "@/types/usuarios";
import { ModalCreatePayment } from "./ModalCreatePayment";
import { ModalEditPayment } from "./ModalEditPayment";
import { ModalComprobante } from "@/components/admin/ui/ModalComprobante";

export const PagosGrid = ({
  pagos,
  id,
  configuracionTarifa,
  fechaInicioMembresia,
}: any) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isComprobanteOpen, setIsComprobanteOpen] = useState(false);

  const [selectedPayment, setSelectedPayment] = useState<SerializedPago | null>(
    null,
  );

  // Abrir Modal de Edición (Formulario)
  const handleEdit = (pago: SerializedPago) => {
    setSelectedPayment(pago);
    setIsEditOpen(true);
  };

  // Abrir Modal de Comprobante (Tu componente de revisión)
  const handleViewComprobante = (pago: SerializedPago) => {
    setSelectedPayment(pago);
    setIsComprobanteOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
          Historial
        </h3>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-md hover:bg-purple-700 font-bold"
        >
          + Nuevo Pago
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        {pagos?.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {pagos.map((pago: any) => (
              <div
                key={pago.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50 group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      pago.estado === "PAGADO"
                        ? "bg-green-100 text-green-600"
                        : "bg-amber-100 text-amber-600"
                    }`}
                  >
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900">
                        ${pago.monto.toFixed(2)}
                      </p>
                      <span className="text-[10px] text-gray-400 uppercase">
                        {pago.metodo}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Mes {pago.mes}/{pago.año}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 ml-2">
                  {pago.comprobante && (
                    <button
                      onClick={() => handleViewComprobante(pago)}
                      className="p-2 sm:p-2.5 bg-blue-50 sm:bg-transparent text-blue-600 rounded-lg sm:opacity-0 sm:group-hover:opacity-100 transition-all"
                    >
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(pago)}
                    className="p-2 sm:p-2.5 bg-purple-50 sm:bg-transparent text-purple-600 rounded-lg sm:opacity-0 sm:group-hover:opacity-100 transition-all"
                  >
                    <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center text-gray-400 text-sm">
            Sin pagos registrados.
          </div>
        )}
      </div>

      {/* 1. MODAL COMPROBANTE (Tu componente) */}
      <ModalComprobante
        isOpen={isComprobanteOpen}
        pagoId={selectedPayment?.id || null}
        imageUrl={selectedPayment?.comprobante || null}
        onClose={() => setIsComprobanteOpen(false)}
        onUpdate={() => {
          // Aquí podrías refrescar la query si es necesario
          setIsComprobanteOpen(false);
        }}
      />

      {/* 2. MODAL EDITAR (Formulario de monto/metodo) */}
      <ModalEditPayment
        pago={selectedPayment}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        userId={id}
      />

      {/* 3. MODAL CREAR */}
      <ModalCreatePayment
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        userId={id}
        configuracionTarifa={configuracionTarifa}
      />
    </div>
  );
};
