"use client";

import React, { useEffect, useState } from "react";
import { Loader2, CheckCircle, Calendar, AlertCircle, CreditCard, Banknote, Smartphone, Wallet } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { $Enums } from "@prisma/client";
import { updatePayment } from "@/actions/admin/users/updatePaymentStatus";

const METODOS = [
  { value: "EFECTIVO", label: "Efectivo", icon: Banknote },
  { value: "TRANSFERENCIA", label: "Transf.", icon: CreditCard },
  { value: "MERCADOPAGO", label: "MP", icon: Smartphone },
  { value: "TARJETA", label: "Tarjeta", icon: Wallet },
] as const;

const MESES_CORTOS = [
  "Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic",
];

function formatCurrency(value: number): string {
  return value.toLocaleString("es-AR");
}

interface InlineEditPaymentProps {
  pago: any;
  userId: string;
  todosLosPagosDelUsuario?: any[];
  userName?: string;
  planNombre?: string;
  onSuccess: () => void;
  onBack: () => void;
}

export function InlineEditPayment({
  pago,
  userId,
  todosLosPagosDelUsuario = [],
  userName,
  planNombre,
  onSuccess,
  onBack,
}: InlineEditPaymentProps) {
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
      setFormData({ monto: pago.monto, estado: $Enums.EstadoPago.PAGADO, metodo: "EFECTIVO" });
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
    onSuccess: () => {
      toast.success("Pago registrado correctamente");
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      onSuccess();
    },
    onError: (err: any) => toast.error(err.message || "Error al cobrar"),
  });

  if (!selectedPago) return null;

  return (
    <div className="space-y-3">
      {/* Header compacto */}
      <div className="-mx-4 -mt-4 px-4 pt-3 pb-3 mb-1" style={{ backgroundColor: "#F8F7FF" }}>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 mb-1.5">
          <CheckCircle className="w-2.5 h-2.5" />
          Terminal de Cobro
        </span>

        <h2 className="text-base font-semibold text-gray-900 mb-0.5">Confirmar Pago</h2>

        {userName && (
          <p className="text-xs text-gray-500">
            <span className="font-medium text-gray-800">{userName}</span>
            {planNombre && <span className="text-violet-600"> — {planNombre}</span>}
          </p>
        )}

        <div className="mt-2">
          {pagosPendientes.length > 1 ? (
            <select
              value={selectedPago.id}
              onChange={(e) => handleSwitchPago(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-md py-1.5 px-2 text-xs font-medium text-gray-700 outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-100"
            >
              {pagosPendientes.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {MESES_CORTOS[p.mes - 1]} {p.año} — ${formatCurrency(p.monto)}
                </option>
              ))}
            </select>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold text-violet-700 bg-violet-50 border border-violet-200">
              <Calendar className="w-3 h-3" />
              {MESES_CORTOS[selectedPago.mes - 1]} {selectedPago.año}
            </span>
          )}
        </div>
      </div>

      {/* Formulario compacto */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateMutation.mutate({ paymentId: selectedPago.id, ...formData });
        }}
        className="space-y-3"
      >
        {/* Monto */}
        <div>
          <label className="block text-[11px] font-medium text-gray-600 mb-1">
            Monto a recibir ($)
          </label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">$</span>
            <input
              type="text"
              inputMode="numeric"
              value={montoDisplay}
              onChange={(e) => handleMontoChange(e.target.value)}
              className="w-full h-9 pl-7 pr-3 text-sm font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:border-violet-400 focus:ring-1 focus:ring-violet-100 outline-none transition-all"
              placeholder="0"
            />
          </div>
        </div>

        {/* Método de pago — Segmented Control compacto */}
        <div>
          <label className="block text-[11px] font-medium text-gray-600 mb-1">Método de pago</label>
          <div className="grid grid-cols-4 gap-1 p-0.5 bg-gray-50 rounded-lg border border-gray-100">
            {METODOS.map(({ value, label, icon: Icon }) => {
              const selected = formData.metodo === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData({ ...formData, metodo: value })}
                  className={`relative flex flex-col items-center gap-0.5 py-2 px-0.5 rounded-md text-[9px] font-semibold transition-all ${
                    selected
                      ? "bg-white text-violet-700 shadow-sm border border-violet-200"
                      : "text-gray-400 hover:text-gray-500"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                  {selected && (
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-violet-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-2 h-2 text-white" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Aviso compacto */}
        <p className="text-[10px] text-gray-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Al confirmar, {MESES_CORTOS[selectedPago.mes - 1]} {selectedPago.año} queda como pagado.
        </p>

        {/* Acciones */}
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
            disabled={updateMutation.isPending}
            className="flex-[2] h-9 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-xs uppercase tracking-wide shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <><CheckCircle className="w-3.5 h-3.5" /> Confirmar Cobro</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}