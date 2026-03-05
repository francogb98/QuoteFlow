"use client";

import React, { useEffect, useState } from "react";
import { X, Loader2, CheckCircle, Calendar, AlertCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { $Enums } from "@prisma/client";
import { updatePayment } from "@/01-actions/admin/users/updatePaymentStatus";

export const ModalEditPayment = ({
  pago,
  isOpen,
  onClose,
  userId,
  todosLosPagosDelUsuario = [],
}: any) => {
  // Filtramos deudas
  const pagosPendientes = todosLosPagosDelUsuario.filter(
    (p: any) => p.estado !== "PAGADO"
  );

  // Inicializamos el estado directamente con el pago recibido
  const [selectedPago, setSelectedPago] = useState<any>(pago);
  const [formData, setFormData] = useState({
    monto: pago?.monto || 0,
    estado: $Enums.EstadoPago.PAGADO,
    metodo: "EFECTIVO",
  });

  // Solo necesitamos UN efecto para sincronizar si el usuario cambia el pago en el select
  const handleSwitchPago = (pagoId: string) => {
    const nuevoPago = pagosPendientes.find((p: any) => p.id === pagoId);
    if (nuevoPago) {
      setSelectedPago(nuevoPago);
      setFormData((prev) => ({ ...prev, monto: nuevoPago.monto }));
    }
  };

  const queryClient = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: (data: any) => updatePayment(data),
    onSuccess: () => {
      toast.success("Pago registrado correctamente");
      // Invalida para que la tabla vea el cambio de semáforo
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      onClose();
    },
    onError: (err: any) => toast.error(err.message || "Error al cobrar"),
  });

  if (!isOpen || !selectedPago) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* HEADER OSCURO */}
        <div className="bg-slate-900 p-8 text-white relative">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">
              Terminal de Cobro
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <h2 className="text-2xl font-black mb-1">Confirmar Pago</h2>

          {pagosPendientes.length > 1 ? (
            <div className="mt-4 space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">
                ¿Qué mes desea cobrar?
              </label>
              <select
                value={selectedPago.id}
                onChange={(e) => handleSwitchPago(e.target.value)}
                className="w-full bg-slate-800 border-none rounded-xl py-3 px-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {pagosPendientes.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    Mes {p.mes}/{p.año} (Debe: ${p.monto})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="mt-2 flex items-center gap-2 text-emerald-400">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-tight">
                Período: Mes {selectedPago.mes}/{selectedPago.año}
              </span>
            </div>
          )}
        </div>

        {/* FORMULARIO DE COBRO */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateMutation.mutate({ paymentId: selectedPago.id, ...formData });
          }}
          className="p-8 space-y-8"
        >
          {/* MONTO GIGANTE AUTOCOMPLETADO */}
          <div className="text-center space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Monto a recibir
            </label>
            <div className="flex items-center justify-center gap-2 group">
              <span className="text-3xl font-black text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                $
              </span>
              <input
                type="number"
                value={formData.monto}
                onChange={(e) =>
                  setFormData({ ...formData, monto: Number(e.target.value) })
                }
                className="w-full text-5xl font-black text-slate-900 bg-transparent border-none focus:ring-0 p-0 text-center"
              />
            </div>
          </div>

          {/* BOTONES DE MÉTODO DE PAGO */}
          <div className="grid grid-cols-2 gap-2">
            {["EFECTIVO", "TRANSFERENCIA", "MERCADOPAGO", "TARJETA"].map(
              (m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setFormData({ ...formData, metodo: m })}
                  className={`py-3 rounded-2xl text-[10px] font-extrabold border-2 transition-all ${
                    formData.metodo === m
                      ? "border-slate-900 bg-slate-900 text-white shadow-lg"
                      : "border-slate-100 text-slate-400 hover:border-slate-200"
                  }`}
                >
                  {m}
                </button>
              )
            )}
          </div>

          {/* AVISO INFORMATIVO */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 italic">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-[10px] text-amber-800 font-medium">
              Al confirmar, el mes{" "}
              <b>
                {selectedPago.mes}/{selectedPago.año}
              </b>{" "}
              quedará marcado como pagado exitosamente.
            </p>
          </div>

          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="w-full py-5 bg-emerald-500 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {updateMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CheckCircle className="w-5 h-5" /> Confirmar Cobro
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
