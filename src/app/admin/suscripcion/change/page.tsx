"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { plans } from "@/lib/data/plansData";
import { useMutation } from "@tanstack/react-query";
import { updateSubscription } from "@/01-actions/admin/suscripcion/updateSuscripcion";
import { toast } from "sonner";

export default function ChangeSubscriptionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams?.get("planId") || undefined;

  const selectedPlan = plans.find((p) => p.id === planId);

  const { mutate, isPending } = useMutation({
    mutationFn: updateSubscription,
    onSuccess: (res: any) => {
      if (res.ok && res.redirectUrl) {
        toast.success("Redirigiendo a Mercado Pago...");
        router.push(res.redirectUrl);
      } else {
        toast.error(res.error || "No se pudo iniciar la suscripción.");
      }
    },
    onError: (err) => {
      console.error(err);
      toast.error("Error al iniciar la suscripción.");
    },
  });

  if (!selectedPlan) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold">Plan inválido</h2>
        <p className="text-sm text-gray-600">Selecciona un plan válido desde la página anterior.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-2">Confirmar cambio de plan</h2>
        <p className="text-sm text-gray-600 mb-4">Vas a seleccionar el plan <span className="font-semibold">{selectedPlan.name}</span> ({selectedPlan.price} — {selectedPlan.period}).</p>
        <ul className="mb-4 list-disc list-inside text-sm text-gray-700">
          {selectedPlan.features.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
        <div className="flex gap-3 justify-end">
          <button className="px-4 py-2 rounded border" onClick={() => router.back()}>Volver</button>
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded"
            onClick={() => mutate({ planId: selectedPlan.id })}
            disabled={isPending}
          >
            {isPending ? "Procesando..." : "Confirmar y pagar"}
          </button>
        </div>
      </div>
    </div>
  );
}
