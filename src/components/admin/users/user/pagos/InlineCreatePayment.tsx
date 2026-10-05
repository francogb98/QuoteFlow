"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Plus,
  Save,
  Loader2,
  DollarSign,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  Info,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { $Enums, TipoConfiguracionTarifa } from "@prisma/client";
import { createPayment } from "@/actions/admin/createPayment";

interface InlineCreatePaymentProps {
  userId: string;
  configuracionTarifa?: any;
  fechaInicioMembresia?: Date;
  onSuccess: () => void;
  onBack: () => void;
}

interface PaymentFormData {
  monto: number;
  estado: $Enums.EstadoPago;
  metodo: string;
  mes?: number;
  año?: number;
  fechaVencimiento?: Date;
}

const estadosPago = [
  { value: $Enums.EstadoPago.PAGADO, label: "Pagado", icon: CheckCircle, color: "emerald" },
  { value: $Enums.EstadoPago.PENDIENTE, label: "Pendiente", icon: Clock, color: "amber" },
  { value: $Enums.EstadoPago.VENCIDO, label: "Vencido", icon: XCircle, color: "red" },
] as const;

const metodosPago = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "MERCADOPAGO", label: "MP" },
  { value: "TRANSFERENCIA", label: "Transf." },
  { value: "TARJETA", label: "Tarjeta" },
] as const;

const meses = [
  "Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic",
];

export function InlineCreatePayment({
  userId,
  configuracionTarifa,
  fechaInicioMembresia,
  onSuccess,
  onBack,
}: InlineCreatePaymentProps) {
  const currentDate = new Date();
  const isDynamicTariff =
    configuracionTarifa?.tipoConfiguracion ===
    TipoConfiguracionTarifa.DINAMICA_POR_FECHA_INGRESO;

  const [formData, setFormData] = useState<PaymentFormData>({
    monto: isDynamicTariff ? configuracionTarifa?.montoBase || 0 : 0,
    estado: $Enums.EstadoPago.PENDIENTE,
    metodo: "EFECTIVO",
    mes: currentDate.getMonth() + 1,
    año: currentDate.getFullYear(),
    fechaVencimiento: isDynamicTariff ? currentDate : undefined,
  });

  useEffect(() => {
    if (isDynamicTariff && configuracionTarifa?.montoBase) {
      setFormData((prev) => ({ ...prev, monto: configuracionTarifa.montoBase }));
    }
  }, [isDynamicTariff, configuracionTarifa]);

  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: (data: PaymentFormData & { usuarioId: string }) => createPayment(data),
    onSuccess: (data) => {
      if (data.ok) {
        toast.success(data.message || "Pago creado correctamente");
        queryClient.invalidateQueries({ queryKey: ["user", userId] });
        queryClient.invalidateQueries({ queryKey: ["usuarios"] });
        onSuccess();
      } else {
        toast.error(data.message || "Error al crear el pago");
      }
    },
    onError: (error: Error) => toast.error(error.message || "Error al crear el pago"),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "monto"
          ? Number.parseFloat(value) || 0
          : name === "mes" || name === "año"
            ? Number.parseInt(value)
            : name === "fechaVencimiento"
              ? (() => {
                  if (!value) return undefined;
                  const [year, month, day] = value.split("-").map(Number);
                  const d = new Date();
                  d.setFullYear(year, month - 1, day);
                  d.setHours(12, 0, 0, 0);
                  d.setMinutes(d.getMinutes() - d.getTimezoneOffset() - 180);
                  return d;
                })()
              : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.monto <= 0) { toast.error("El monto debe ser mayor a 0"); return; }
    if (isDynamicTariff) {
      if (!formData.fechaVencimiento) { toast.error("Fecha de vencimiento requerida"); return; }
    } else {
      if (!formData.mes || !formData.año) { toast.error("Mes y año requeridos"); return; }
    }
    createMutation.mutate({ ...formData, usuarioId: userId });
  };

  const statusConfig = estadosPago.find((e) => e.value === formData.estado) || estadosPago[1];
  const years = Array.from({ length: 11 }, (_, i) => currentDate.getFullYear() - 5 + i);

  const formatDateForArgentina = (date: Date | undefined): string => {
    if (!date) return "";
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    const arg = new Date(utc - 180 * 60000);
    return `${arg.getUTCFullYear()}-${String(arg.getUTCMonth() + 1).padStart(2, "0")}-${String(arg.getUTCDate()).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-3">
      {/* Header compacto */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Plus className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Nuevo Pago</h3>
          <p className="text-[10px] text-gray-400">
            {isDynamicTariff ? "Dinámico por fecha" : "Fijo mensual"}
          </p>
        </div>
      </div>

      {isDynamicTariff && (
        <div className="flex items-center gap-1.5 text-[11px] text-blue-700 bg-blue-50 rounded-md px-2 py-1.5">
          <Info className="w-3 h-3 flex-shrink-0" />
          <span>Sistema dinámico — especifica fecha de vencimiento exacta.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Fila 1: Fecha/Mes+Año + Monto */}
        {isDynamicTariff ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">
                <Calendar className="w-3 h-3 inline mr-0.5" />
                Vencimiento
              </label>
              <input
                type="date"
                name="fechaVencimiento"
                value={formatDateForArgentina(formData.fechaVencimiento)}
                onChange={handleChange}
                className="w-full h-9 px-2.5 text-xs border border-gray-200 rounded-lg focus:border-violet-400 focus:ring-1 focus:ring-violet-100 outline-none bg-gray-50"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">
                <DollarSign className="w-3 h-3 inline mr-0.5" />
                Monto ($)
                {isDynamicTariff && (
                  <span className="text-[9px] text-blue-500 ml-0.5">
                    Sug: ${configuracionTarifa?.montoBase}
                  </span>
                )}
              </label>
              <input
                type="number"
                name="monto"
                value={formData.monto}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full h-9 pl-6 pr-2.5 text-xs border border-gray-200 rounded-lg focus:border-violet-400 focus:ring-1 focus:ring-violet-100 outline-none bg-gray-50"
                required
              />
              <span className="relative -top-7 left-2 text-gray-400 text-[11px] pointer-events-none">$</span>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  <Calendar className="w-3 h-3 inline mr-0.5" />Mes
                </label>
                <select
                  name="mes"
                  value={formData.mes}
                  onChange={handleChange}
                  className="w-full h-9 px-2 text-xs border border-gray-200 rounded-lg focus:border-violet-400 focus:ring-1 focus:ring-violet-100 outline-none bg-gray-50"
                  required
                >
                  {meses.map((m, i) => (
                    <option key={m} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">Año</label>
                <select
                  name="año"
                  value={formData.año}
                  onChange={handleChange}
                  className="w-full h-9 px-2 text-xs border border-gray-200 rounded-lg focus:border-violet-400 focus:ring-1 focus:ring-violet-100 outline-none bg-gray-50"
                  required
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  <DollarSign className="w-3 h-3 inline mr-0.5" />Monto ($)
                </label>
                <input
                  type="number"
                  name="monto"
                  value={formData.monto}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full h-9 pl-5 pr-2 text-xs border border-gray-200 rounded-lg focus:border-violet-400 focus:ring-1 focus:ring-violet-100 outline-none bg-gray-50"
                  placeholder="0"
                  required
                />
              </div>
            </div>
          </>
        )}

        {/* Fila 2: Estado + Método */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-1">Estado</label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className={`w-full h-9 px-2 text-xs font-medium rounded-lg border cursor-pointer transition-all ${
                statusConfig.color === "emerald"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : statusConfig.color === "amber"
                    ? "bg-amber-50 border-amber-200 text-amber-700"
                    : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {estadosPago.map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-1">
              <CreditCard className="w-3 h-3 inline mr-0.5" />Método
            </label>
            <select
              name="metodo"
              value={formData.metodo}
              onChange={handleChange}
              className="w-full h-9 px-2 text-xs border border-gray-200 rounded-lg focus:border-violet-400 focus:ring-1 focus:ring-violet-100 outline-none bg-gray-50"
            >
              {metodosPago.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Aviso compacto */}
        <p className="text-[10px] text-gray-400 flex items-center gap-1">
          <Info className="w-3 h-3" />
          No se puede crear más de un pago por mes por usuario.
        </p>

        {/* Botones */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 h-9 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-lg transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex-1 flex items-center justify-center gap-1.5 h-9 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white text-xs font-medium rounded-lg shadow-sm transition-all disabled:cursor-not-allowed"
          >
            {createMutation.isPending ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Creando...</>
            ) : (
              <><Save className="w-3.5 h-3.5" /> Crear Pago</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}