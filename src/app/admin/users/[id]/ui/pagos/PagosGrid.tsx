"use client";

import { CreditCard, Plus } from "lucide-react";
import { useState } from "react";
import { PagosCard } from "./PagosCard";
import { ModalEditPayment } from "../ModalEditPayment";
import { ModalCreatePayment } from "../ModalCreatePayment";
import type { SerializedPago } from "@/types/usuarios";

interface PagosGridProps {
  pagos: SerializedPago[];
  id: string;
}

export const PagosGrid = ({ pagos, id }: PagosGridProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<SerializedPago | null>(
    null
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleEditPayment = (pago: SerializedPago) => {
    setSelectedPayment(pago);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPayment(null);
  };

  const handleCreatePayment = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 border-b border-emerald-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-emerald-600" />
              Historial de Pagos
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {pagos?.length
                ? `${pagos.length} pagos registrados`
                : "Sin registros de pago"}
            </p>
          </div>
          <button
            onClick={handleCreatePayment}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
            Crear Pago
          </button>
        </div>
      </div>

      <div className="p-6">
        {pagos?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pagos.map((pago) => (
              <PagosCard
                key={pago.id}
                pago={pago}
                handleEditPayment={handleEditPayment}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sin registros de pago
            </h3>
            <p className="text-gray-600 text-sm">
              Este usuario aún no tiene pagos registrados en el sistema.
            </p>
            <button
              onClick={handleCreatePayment}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Crear Primer Pago
            </button>
          </div>
        )}
      </div>

      {/* Modales */}
      <ModalEditPayment
        pago={selectedPayment}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        userId={id}
      />

      <ModalCreatePayment
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        userId={id}
      />
    </div>
  );
};
