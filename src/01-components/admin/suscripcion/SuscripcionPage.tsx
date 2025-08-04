"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { plans, PlanOption } from "@/lib/data/plansData";
import { toast } from "sonner";
import { Gift, Zap, Crown, CheckCircle2 } from "lucide-react";
import { getSubscriptionInfo } from "@/01-actions/admin/suscripcion/getInfoSuscripcion";
import { updateSubscription } from "@/01-actions/admin/suscripcion/updateSuscripcion";

// Componente para la tarjeta de cada plan
const PlanCard = ({
  plan,
  isCurrent,
  onSelect,
  isPending,
}: {
  plan: PlanOption;
  isCurrent: boolean;
  onSelect: (planId: string) => void;
  isPending: boolean;
}) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-lg p-6 md:p-8 flex flex-col justify-between transform transition-all duration-300
        ${
          isCurrent
            ? "border-2 border-purple-600 shadow-purple-200 scale-105"
            : "hover:scale-105"
        }
      `}
    >
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <div
            className={`bg-gradient-to-br ${plan.color} text-white p-3 rounded-full shadow-lg`}
          >
            {plan.icon}
          </div>
          <h2 className="text-xl font-bold text-gray-800">{plan.name}</h2>
        </div>
        <div className="text-4xl font-extrabold text-gray-900 mb-2">
          {plan.price}
          <span className="text-base font-medium text-gray-500 ml-1">
            {plan.period}
          </span>
        </div>
        {plan.originalPrice && (
          <p className="text-sm text-gray-400 line-through mb-4">
            {plan.originalPrice}
          </p>
        )}
        <ul className="space-y-2 text-gray-600 mb-6">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <CheckCircle2 size={18} className="text-green-500 mr-2" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={() => onSelect(plan.id)}
        disabled={isCurrent || isPending}
        className={`w-full py-3 px-4 rounded-lg font-bold text-white text-lg transition-colors duration-200
          ${
            isCurrent
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          }
        `}
      >
        {isCurrent
          ? "Plan Actual"
          : isPending
          ? "Procesando..."
          : "Seleccionar Plan"}
      </button>
    </div>
  );
};

export const SubscriptionPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Obtener la información de la suscripción actual del usuario
  const { data: subscriptionData, isPending: isSubscriptionPending } = useQuery(
    {
      queryKey: ["subscription-info"],
      queryFn: getSubscriptionInfo,
    }
  );

  // Mutación para actualizar/crear la suscripción
  const { mutate, isPending: isUpdatePending } = useMutation({
    mutationFn: updateSubscription,
    onSuccess: (result) => {
      if (result.ok && result.redirectUrl) {
        toast.success(
          "Redirigiendo a Mercado Pago para completar la suscripción..."
        );
        router.push(result.redirectUrl);
      } else {
        toast.error(result.error || "Error al procesar el plan.");
      }
    },
    onError: (error) => {
      toast.error("Ocurrió un error inesperado al actualizar el plan.");
      console.error(error);
    },
  });

  const handleSelectPlan = (planId: string) => {
    mutate({ planId });
  };

  if (isSubscriptionPending) {
    return (
      <div className="text-center text-gray-500 p-8">
        Cargando planes y suscripción...
      </div>
    );
  }

  console.log(subscriptionData);
  const { empresa } = subscriptionData!;

  // Lógica para determinar el plan actual y si es de prueba
  const isTrial = empresa?.esCuentaPrueba;
  const currentPlanId = isTrial
    ? null
    : `${empresa?.planTipo.toLowerCase()}_${empresa?.frecuenciaPago.toLowerCase()}`;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          Gestión de Suscripción
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Gestiona tu membresía, actualiza tu plan o cambia tu ciclo de
          facturación.
        </p>
      </div>

      {/* Sección de estado actual (plan o prueba) */}
      <div className="mb-10 max-w-xl mx-auto bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-600">
        <h2 className="text-xl font-bold mb-2">Estado Actual de tu Cuenta</h2>
        {isTrial ? (
          <div className="text-gray-700">
            <p className="font-semibold text-purple-600">
              Estás en un plan de prueba.
            </p>
            {empresa?.fechaFinPrueba && (
              <p className="text-sm mt-1">
                Tu período de prueba finaliza el{" "}
                <span className="font-bold">
                  {format(
                    new Date(empresa.fechaFinPrueba),
                    "dd 'de' MMMM, yyyy",
                    { locale: es }
                  )}
                </span>
              </p>
            )}
            <p className="text-sm mt-3">
              Selecciona un plan de la lista de abajo para iniciar tu
              suscripción de pago.
            </p>
          </div>
        ) : (
          <div className="text-gray-700">
            <p>
              Estás suscrito al plan **{empresa?.planTipo}** con frecuencia **
              {empresa?.frecuenciaPago}**.
            </p>
            {empresa?.fechaProximoVencimiento && (
              <p className="text-sm mt-1">
                Próximo vencimiento:{" "}
                <span className="font-bold">
                  {format(
                    new Date(empresa.fechaProximoVencimiento),
                    "dd 'de' MMMM, yyyy",
                    { locale: es }
                  )}
                </span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Sección de planes disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrent={plan.id === currentPlanId}
            onSelect={handleSelectPlan}
            isPending={isUpdatePending}
          />
        ))}
      </div>
    </div>
  );
};
