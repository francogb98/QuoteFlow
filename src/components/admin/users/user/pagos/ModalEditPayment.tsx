"use client";

import React, { useEffect, useState } from "react";
import { X, Loader2, CheckCircle, Calendar, AlertCircle, CreditCard, Banknote, Smartphone, Wallet } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { $Enums } from "@prisma/client";
import { updatePayment } from "@/actions/admin/users/updatePaymentStatus";

const METODOS = [
  { value: "EFECTIVO", label: "Efectivo", icon: Banknote },
  { value: "TRANSFERENCIA", label: "Transferencia", icon: CreditCard },
  { value: "MERCADOPAGO", label: "MercadoPago", icon: Smartphone },
  { value: "TARJETA", label: "Tarjeta", icon: Wallet },
] as const;

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function formatCurrency(value: number): string {
  return value.toLocaleString("es-AR");
}

export const ModalEditPayment = ({
  pago,
  isOpen,
  onClose,
  userId,
  todosLosPagosDelUsuario = [],
  userName,
  planNombre,
}: any) => {
  const pagosPendientes = todosLosPagosDelUsuario.filter(
    (p: any) => p.estado !== "PAGADO",
  );

  const [selectedPago, setSelectedPago] = useState<any>(null);
  const [montoDisplay, setMontoDisplay] = useState("");

  const [formData, setFormData] = useState({
    monto: 0,
    estado: $Enums.EstadoPago.PAGADO,
    metodo: "EFECTIVO",
  });

  useEffect(() => {
    if (pago) {
      setSelectedPago(pago);
      setFormData({
        monto: pago.monto,
        estado: $Enums.EstadoPago.PAGADO,
        metodo: "EFECTIVO",
      });
      setMontoDisplay(formatCurrency(pago.monto));
    }
  }, [pago]);

  const handleSwitchPago = (pagoId: string) => {
    const nuevoPago = pagosPendientes.find((p: any) => p.id === pagoId);
    if (nuevoPago) {
      setSelectedPago(nuevoPago);
      setFormData((prev) => ({ ...prev, monto: nuevoPago.monto }));
      setMontoDisplay(formatCurrency(nuevoPago.monto));
    }
  };

  const handleMontoChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    const num = Number(digits);
    setFormData((prev) => ({ ...prev, monto: num }));
    setMontoDisplay(digits ? formatCurrency(num) : "");
  };

  const queryClient = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: (data: any) => updatePayment(data),
    onSuccess: (data: any) => {
      // updatePayment responde { ok: false, message } sin lanzar errores
      if (!data?.ok) {
        toast.error(data?.message || "Error al cobrar");
        return;
      }
      toast.success(data?.message || "Pago registrado correctamente");
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      onClose();
    },
    onError: (err: any) => toast.error(err.message || "Error al cobrar"),
  });

  if (!isOpen || !selectedPago) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-5" style={{ backgroundColor: "#F8F7FF" }}>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 mb-3">
            <CheckCircle className="w-3 h-3" />
            Terminal de Cobro
          </span>

          <h2 className="text-lg font-bold text-gray-900 mb-1">
            Confirmar Pago
          </h2>

          {userName && (
            <p className="text-sm text-gray-600">
              Cobrar a: <span className="font-semibold text-gray-900">{userName}</span>
              {planNombre && (
                <span className="text-violet-600 font-medium"> — {planNombre}</span>
              )}
            </p>
          )}

          {/* Period badge */}
          <div className="mt-3">
            {pagosPendientes.length > 1 ? (
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-gray-500 uppercase">
                  Período a cobrar
                </label>
                <select
                  value={selectedPago.id}
                  onChange={(e) => handleSwitchPago(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm font-medium text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                >
                  {pagosPendientes.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {MESES[p.mes - 1]} {p.año} — ${formatCurrency(p.monto)}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-200">
                <Calendar className="w-3.5 h-3.5" />
                {MESES[selectedPago.mes - 1]} {selectedPago.año}
              </span>
            )}
          </div>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateMutation.mutate({ paymentId: selectedPago.id, ...formData });
          }}
          className="px-6 py-5 space-y-5"
        >
          {/* Monto */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Monto a recibir ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                $
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={montoDisplay}
                onChange={(e) => handleMontoChange(e.target.value)}
                className="w-full h-11 pl-8 pr-4 text-lg font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                placeholder="0"
              />
            </div>
          </div>

          {/* Método de pago — Segmented Control */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Método de pago
            </label>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-gray-50 rounded-xl border border-gray-100">
              {METODOS.map(({ value, label, icon: Icon }) => {
                const selected = formData.metodo === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData({ ...formData, metodo: value })}
                    className={`relative flex flex-col items-center gap-1 py-2.5 px-1 rounded-lg text-[10px] font-semibold transition-all ${
                      selected
                        ? "bg-white text-violet-700 shadow-sm border border-violet-200"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                    {selected && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-2.5 h-2.5 text-white" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Info */}
          <div className="flex gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
            <AlertCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-800 leading-relaxed">
              Al confirmar, el mes de{" "}
              <b>{MESES[selectedPago.mes - 1]} {selectedPago.año}</b>{" "}
              quedará marcado como pagado.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold uppercase tracking-wide shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Confirmar Cobro
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};