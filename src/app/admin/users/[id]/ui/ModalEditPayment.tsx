"use client";

import { useEffect, useState } from "react";
import {
  X,
  Edit,
  Save,
  Loader2,
  DollarSign,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { $Enums } from "@prisma/client";
import { updatePayment } from "@/actions/payments/updatePaymentStatus";

const estadosPago = [
  {
    value: $Enums.EstadoPago.PAGADO,
    label: "Pagado",
    icon: CheckCircle,
    color: "emerald",
  },
  {
    value: $Enums.EstadoPago.PENDIENTE,
    label: "Pendiente",
    icon: Clock,
    color: "amber",
  },
  {
    value: $Enums.EstadoPago.VENCIDO,
    label: "Vencido",
    icon: XCircle,
    color: "red",
  },
];

const metodosPago = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "MERCADOPAGO", label: "Mercado Pago" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "TARJETA", label: "Tarjeta" },
];

export const ModalEditPayment = ({ pago, isOpen, onClose, userId }: any) => {
  console.log(pago);

  const [formData, setFormData] = useState({
    monto: pago?.monto || "0",
    estado: pago?.estado || $Enums.EstadoPago.PENDIENTE,
    metodo: pago?.metodo || "EFECTIVO",
  });

  useEffect(() => {
    setFormData({
      monto: pago?.monto || "0",
      estado: pago?.estado || $Enums.EstadoPago.PENDIENTE,
      metodo: pago?.metodo || "EFECTIVO",
    });
  }, [pago]);

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data) => updatePayment(data),
    onSuccess: (data) => {
      //@ts-ignore
      toast.success(data.message || "Pago actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || "Error al actualizar el pago");
    },
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "monto" ? Number.parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    if (!pago) {
      toast.error("No se encontró el pago a editar");
      return;
    }

    if (formData.monto <= 0) {
      toast.error("El monto debe ser mayor a 0");
      return;
    }
    //@ts-ignore
    updateMutation.mutate({
      paymentId: pago.id,
      ...formData,
    });
  };

  const getStatusConfig = (estado: any) => {
    return estadosPago.find((e) => e.value === estado) || estadosPago[1];
  };

  const statusConfig = getStatusConfig(formData.estado);

  if (!isOpen || !pago) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all animate-in zoom-in-95 duration-300">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <span className="sr-only">Cerrar modal</span>
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="bg-gradient-to-r from-purple-50 to-emerald-50 p-6 border-b border-purple-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                <Edit className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Editar Pago</h2>
                <p className="text-sm text-gray-600">
                  {pago.mes}/{pago.año}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Monto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Monto
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  $
                </span>
                <input
                  type="text"
                  name="monto"
                  value={formData.monto}
                  onChange={handleChange}
                  className="w-full h-11 pl-8 pr-4 text-base border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-300 placeholder:text-gray-400 bg-purple-50/50"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado del Pago
              </label>
              <div className="relative">
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className={`w-full appearance-none px-4 py-3 text-sm font-medium rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                    statusConfig.color === "emerald"
                      ? "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 text-emerald-800"
                      : statusConfig.color === "amber"
                      ? "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 text-amber-800"
                      : "bg-gradient-to-r from-red-50 to-red-50 border-red-200 text-red-800"
                  }`}
                >
                  {estadosPago.map((estado) => (
                    <option key={estado.value} value={estado.value}>
                      {estado.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  {statusConfig.icon && (
                    <statusConfig.icon className="w-4 h-4 text-gray-500" />
                  )}
                </div>
              </div>
            </div>

            {/* Método de Pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CreditCard className="w-4 h-4 inline mr-1" />
                Método de Pago
              </label>
              <select
                name="metodo"
                value={formData.metodo}
                onChange={handleChange}
                className="w-full h-11 px-4 text-base border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-300 bg-purple-50/50"
              >
                {metodosPago.map((metodo) => (
                  <option key={metodo.value} value={metodo.value}>
                    {metodo.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Información adicional */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
                <div>
                  <p className="text-sm text-blue-800 font-medium mb-1">
                    Información del pago
                  </p>
                  <p className="text-xs text-blue-700">
                    Período: {pago.mes}/{pago.año} • Fecha:{" "}
                    {new Date(pago.fecha).toLocaleDateString("es-ES")}
                  </p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-medium rounded-lg transition-all duration-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:transform-none transition-all duration-300 disabled:cursor-not-allowed"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
