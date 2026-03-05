"use client";

import { useState } from "react";
import { crearSuscripcion } from "@/01-actions/admin/suscriptions/suscriptions";
import { TipoPlanEmpresa, FrecuenciaPago } from "@prisma/client";
import { plans } from "@/lib/plans/data";

interface Props {
  planActual: string;
  frecuenciaActual: string;
}

export default function PlanSelector({ planActual, frecuenciaActual }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConfirmar = async () => {
    if (!selectedId) return;

    const [planBase, frecuencia] = selectedId.split("_");

    const plan =
      planBase === "basico" ? TipoPlanEmpresa.BASICO : TipoPlanEmpresa.PRO;

    const frecuenciaEnum =
      frecuencia === "mensual" ? FrecuenciaPago.MENSUAL : FrecuenciaPago.ANUAL;

    setLoading(true);

    try {
      const res = await crearSuscripcion(plan, frecuenciaEnum);

      console.log("Respuesta crearSuscripcion:", res);

      // 🔥 Caso nueva suscripción (redirige a Mercado Pago)
      if (res?.redirectUrl) {
        window.location.href = res.redirectUrl;
        return;
      }

      // 🔥 Caso update sin redirección
      if (res?.updated) {
        alert(res.message);
        window.location.reload(); // opcional pero recomendado
        return;
      }

      console.log("Respuesta inesperada:", res);
    } catch (error) {
      console.error("Error creando suscripción:", error);
      alert("Ocurrió un error al procesar la suscripción.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {plans.map((plan) => {
        const isSelected = selectedId === plan.id;

        return (
          <div
            key={plan.id}
            onClick={() => setSelectedId(plan.id)}
            className={`cursor-pointer p-6 rounded-xl border transition ${
              isSelected ? "border-purple-600" : "border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              {plan.icon}
              <h3 className="font-bold">{plan.name}</h3>
            </div>

            <p className="text-2xl font-bold">
              {plan.price}
              <span className="text-sm font-normal ml-1">{plan.period}</span>
            </p>

            {plan.originalPrice && (
              <p className="line-through text-gray-400 text-sm">
                {plan.originalPrice}
              </p>
            )}

            {plan.badge && (
              <p className="text-xs text-purple-600 mt-1">{plan.badge}</p>
            )}

            <ul className="mt-4 space-y-1 text-sm text-gray-600">
              {plan.features.map((f, i) => (
                <li key={i}>• {f}</li>
              ))}
            </ul>
          </div>
        );
      })}

      <div className="md:col-span-2 mt-6">
        <button
          onClick={handleConfirmar}
          disabled={!selectedId || loading}
          className="w-full bg-purple-700 text-white py-3 rounded-lg disabled:opacity-50"
        >
          {loading ? "Redirigiendo..." : "Confirmar y continuar"}
        </button>
      </div>
    </div>
  );
}
