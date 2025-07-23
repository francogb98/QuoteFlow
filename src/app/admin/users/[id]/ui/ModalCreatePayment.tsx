"use client";

import type React from "react";

import { useState } from "react";
import {
  X,
  Plus,
  Save,
  Loader2,
  DollarSign,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { $Enums } from "@prisma/client";
import { createPayment } from "@/actions/admin/createPayment";

interface ModalCreatePaymentProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

interface PaymentFormData {
  monto: number;
  estado: $Enums.EstadoPago;
  metodo: string;
  mes: number;
  año: number;
}

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
] as const;

const metodosPago = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "MERCADOPAGO", label: "Mercado Pago" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "TARJETA", label: "Tarjeta" },
] as const;

const meses = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export const ModalCreatePayment = ({
  isOpen,
  onClose,
  userId,
}: ModalCreatePaymentProps) => {
  const currentDate = new Date();
  const [formData, setFormData] = useState<PaymentFormData>({
    monto: 0,
    estado: $Enums.EstadoPago.PENDIENTE,
    metodo: "EFECTIVO",
    mes: currentDate.getMonth() + 1,
    año: currentDate.getFullYear(),
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: PaymentFormData & { usuarioId: string }) =>
      createPayment(data),
    onSuccess: (data) => {
      toast.success(data.message || "Pago creado correctamente");
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      onClose();
      // Reset form
      setFormData({
        monto: 0,
        estado: $Enums.EstadoPago.PENDIENTE,
        metodo: "EFECTIVO",
        mes: currentDate.getMonth() + 1,
        año: currentDate.getFullYear(),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear el pago");
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "monto"
          ? Number.parseFloat(value) || 0
          : name === "mes" || name === "año"
          ? Number.parseInt(value)
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.monto <= 0) {
      toast.error("El monto debe ser mayor a 0");
      return;
    }

    if (formData.mes < 1 || formData.mes > 12) {
      toast.error("El mes debe estar entre 1 y 12");
      return;
    }

    if (formData.año < 2020 || formData.año > 2030) {
      toast.error("El año debe estar entre 2020 y 2030");
      return;
    }

    createMutation.mutate({
      ...formData,
      usuarioId: userId,
    });
  };

  const getStatusConfig = (estado: $Enums.EstadoPago) => {
    return estadosPago.find((e) => e.value === estado) || estadosPago[1];
  };

  const statusConfig = getStatusConfig(formData.estado);

  // Generar años disponibles
  const years = Array.from(
    { length: 11 },
    (_, i) => currentDate.getFullYear() - 5 + i
  );

  if (!isOpen) return null;

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
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Crear Nuevo Pago
                </h2>
                <p className="text-sm text-gray-600">
                  Agregar un pago para este usuario
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Período */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Mes
                </label>
                <select
                  name="mes"
                  value={formData.mes}
                  onChange={handleChange}
                  className="w-full h-11 px-4 text-base border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-300 bg-purple-50/50"
                  required
                >
                  {meses.map((mes, index) => (
                    <option key={mes} value={index + 1}>
                      {mes}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Año
                </label>
                <select
                  name="año"
                  value={formData.año}
                  onChange={handleChange}
                  className="w-full h-11 px-4 text-base border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-300 bg-purple-50/50"
                  required
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

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
                  type="number"
                  name="monto"
                  value={formData.monto}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
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
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <div className="flex items-start">
                <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <div>
                  <p className="text-sm text-amber-800 font-medium mb-1">
                    Importante
                  </p>
                  <p className="text-xs text-amber-700">
                    No se puede crear más de un pago por mes para el mismo
                    usuario. Verifica que no exista ya un pago para{" "}
                    {meses[formData.mes - 1]} {formData.año}.
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
                disabled={createMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:transform-none transition-all duration-300 disabled:cursor-not-allowed"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Crear Pago
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
