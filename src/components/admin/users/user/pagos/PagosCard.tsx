"use client";

import { useState } from "react";
import {
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Edit,
  XCircle,
  AlertTriangle,
  Eye,
} from "lucide-react";
// Asegúrate de que la ruta sea la correcta hacia tu modal actualizado
import { ModalComprobante } from "@/components/admin/ui/ModalComprobante";

const estadosPago = [
  {
    value: "PAGADO",
    label: "Pagado",
    icon: CheckCircle,
    color: "emerald",
  },
  {
    value: "PENDIENTE",
    label: "Pendiente",
    icon: Clock,
    color: "amber",
  },
  {
    value: "VENCIDO",
    label: "Vencido",
    icon: XCircle,
    color: "red",
  },
  {
    value: "RECHAZADO", // Agregamos este por si el pago ya fue rechazado
    label: "Rechazado",
    icon: XCircle,
    color: "red",
  },
];

const getStatusConfig = (estado: string) => {
  const config = estadosPago.find((e) => e.value === estado);
  return config || estadosPago[1];
};

interface PagosCardProps {
  pago: any;
  handleEditPayment: (pago: any) => void;
  onUpdate?: () => void; // Agregamos esta prop para refrescar la lista
}

export const PagosCard = ({
  pago,
  handleEditPayment,
  onUpdate,
}: PagosCardProps) => {
  const [openComprobante, setOpenComprobante] = useState(false);

  const statusConfig = getStatusConfig(pago.estado);

  return (
    <>
      <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">
                  ${pago.monto.toFixed(2)}
                </span>
                <p className="text-xs text-gray-500">
                  {pago.mes}/{pago.año}
                </p>
              </div>
            </div>
          </div>

          {/* Estado */}
          <div className="mb-4">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
                statusConfig.color === "emerald"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : statusConfig.color === "amber"
                    ? "bg-amber-50 border-amber-200 text-amber-800"
                    : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              <statusConfig.icon className="w-3 h-3" />
              {statusConfig.label}
            </span>
          </div>

          {/* Información */}
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              {new Date(pago.fecha).toLocaleDateString("es-ES")}
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
              {pago.metodo || "No especificado"}
            </div>

            {/* Comprobante */}
            <div className="flex items-center text-sm">
              {pago.comprobante ? (
                <button
                  onClick={() => setOpenComprobante(true)}
                  className="flex items-center gap-1 text-emerald-700 hover:underline font-medium"
                >
                  <Eye className="w-4 h-4" />
                  Ver comprobante
                </button>
              ) : (
                <div className="flex items-center gap-1 text-amber-700 font-medium">
                  <AlertTriangle className="w-4 h-4" />
                  Comprobante aún no cargado
                </div>
              )}
            </div>
          </div>

          {/* Acciones */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => handleEditPayment(pago)}
              className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition-colors"
            >
              <Edit className="w-3 h-3" />
              Editar
            </button>
          </div>
        </div>
      </div>

      {/* Modal actualizado para conectarse con la lógica de backend interna */}
      <ModalComprobante
        isOpen={openComprobante}
        imageUrl={pago.comprobante}
        pagoId={pago.id} // Cambiado de 'editable' a 'pagoId'
        onClose={() => setOpenComprobante(false)}
        onUpdate={onUpdate} // Para refrescar la lista de pagos después de aprobar/rechazar
      />
    </>
  );
};
