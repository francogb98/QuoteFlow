"use client";

import { cancelarSuscripcion } from "@/01-actions/payment/cancelar-suscripcion";
import { SuscripcionEmpresa } from "@prisma/client";
import { useState } from "react";

interface Props {
  suscripcion: SuscripcionEmpresa;
}

const estadoMap: Record<string, { label: string; color: string }> = {
  TRIAL: { label: "Período de prueba", color: "text-blue-600" },
  ACTIVA: { label: "Activa", color: "text-green-600" },
  PENDIENTE: { label: "Pago pendiente", color: "text-yellow-600" },
  CANCELADA: { label: "Cancelada", color: "text-red-600" },
  VENCIDA: { label: "Vencida", color: "text-red-700" },
};

export default function SubscriptionCard({ suscripcion }: Props) {
  const [loading, setLoading] = useState(false);

  const estado = estadoMap[suscripcion.estadoSuscripcion] || {
    label: suscripcion.estadoSuscripcion,
    color: "text-gray-600",
  };

  const handleCancelar = async () => {
    const confirm = window.confirm(
      "¿Seguro que querés cancelar tu suscripción?",
    );

    if (!confirm) return;

    setLoading(true);

    try {
      const res = await cancelarSuscripcion();

      if (res?.ok) {
        window.location.reload();
      }
    } catch (error) {
      alert("Error al cancelar la suscripción.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-4">
      <div className="flex justify-between">
        <span className="font-medium">Plan</span>
        <span>{suscripcion.planTipo}</span>
      </div>

      <div className="flex justify-between">
        <span className="font-medium">Frecuencia</span>
        <span>
          {suscripcion.frecuenciaPago === "MENSUAL" ? "Mensual" : "Anual"}
        </span>
      </div>

      <div className="flex justify-between">
        <span className="font-medium">Estado</span>
        <span className={estado.color}>{estado.label}</span>
      </div>

      <div className="flex justify-between">
        <span className="font-medium">Inicio</span>
        <span>{new Date(suscripcion.fechaInicio).toLocaleDateString()}</span>
      </div>

      <div className="flex justify-between">
        <span className="font-medium">Vence</span>
        <span>
          {suscripcion.fechaFinPeriodoActual
            ? new Date(suscripcion.fechaFinPeriodoActual).toLocaleDateString()
            : "—"}
        </span>
      </div>

      {suscripcion.estadoPagoMercadoPago && (
        <div className="flex justify-between">
          <span className="font-medium">Estado MercadoPago</span>
          <span>{suscripcion.estadoPagoMercadoPago}</span>
        </div>
      )}

      {suscripcion.estadoSuscripcion === "ACTIVA" && (
        <div className="pt-4 border-t">
          <button
            onClick={handleCancelar}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? "Cancelando..." : "Cancelar suscripción"}
          </button>
        </div>
      )}
    </div>
  );
}
