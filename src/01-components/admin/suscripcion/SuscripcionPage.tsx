"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { plans, PlanOption } from "@/lib/data/plansData";
import { toast } from "sonner";
import {
  Gift,
  Zap,
  Crown,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { getSubscriptionInfo } from "@/01-actions/admin/suscripcion/getInfoSuscripcion";
import { updateSubscription } from "@/01-actions/admin/suscripcion/updateSuscripcion";
import { cancelSubscription } from "@/01-actions/admin/suscripcion/cancelSuscripcion";

// Componente para mostrar el estado de la suscripción con barra de progreso
const StatusCard = ({ empresa, onCancel, isCancelling }: any) => {
  const isTrial = empresa?.esCuentaPrueba;
  const diasRestantes = empresa?.diasRestantesPrueba ?? 0;
  const estaProximoAVencer = empresa?.estaProximoAVencer;

  if (isTrial) {
    const totalDiasPrueba = 60; // Ajusta según tu duración de prueba (por defecto 2 meses = ~60 días)
    const diasUsados = totalDiasPrueba - diasRestantes;
    const porcentajeUsado = Math.min((diasUsados / totalDiasPrueba) * 100, 100);

    return (
      <div className="mb-10 max-w-2xl mx-auto bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-lg p-8 border-l-4 border-blue-600">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Gift size={28} className="text-blue-600" />
              Plan de Prueba Activo
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Acceso completo durante tu período de evaluación
            </p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="my-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">
              Tiempo restante:
            </span>
            <span className="text-2xl font-bold text-blue-600 flex items-center gap-1">
              <Clock size={20} />
              {diasRestantes} día{diasRestantes !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${porcentajeUsado}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {diasUsados} de {totalDiasPrueba} días usados
          </p>
        </div>

        {/* Fecha de finalización */}
        {empresa?.fechaFinPrueba && (
          <p className="text-sm text-gray-700">
            Tu período de prueba finaliza el{" "}
            <span className="font-bold text-blue-600">
              {format(
                new Date(empresa.fechaFinPrueba),
                "EEEE, dd 'de' MMMM 'de' yyyy",
                { locale: es }
              )}
            </span>
          </p>
        )}

        <p className="text-sm text-gray-700 mt-4 italic">
          💡 Selecciona un plan de abajo para suscribirte cuando estés listo.
          Puedes cambiar o upgrade tu plan incluso antes de que venza la prueba.
        </p>
      </div>
    );
  }

  // Estado de suscrito
  return (
    <div
      className={`mb-10 max-w-2xl mx-auto rounded-xl shadow-lg p-8 border-l-4 transition-all ${
        estaProximoAVencer
          ? "bg-gradient-to-r from-orange-50 to-orange-100 border-orange-600"
          : "bg-gradient-to-r from-green-50 to-green-100 border-green-600"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {estaProximoAVencer ? (
              <AlertCircle size={28} className="text-orange-600" />
            ) : (
              <CheckCircle2 size={28} className="text-green-600" />
            )}
            {estaProximoAVencer ? "Próximo a Vencer" : "Plan Activo"}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {empresa?.planTipo} • {empresa?.frecuenciaPago}
          </p>
        </div>
      </div>

      {/* Información de pago */}
      <div className="grid grid-cols-2 gap-4 my-6">
        {empresa?.fechaUltimoPago && (
          <div className="bg-white rounded-lg p-4">
            <p className="text-xs text-gray-600 uppercase tracking-wide">
              Último pago
            </p>
            <p className="text-lg font-bold text-gray-800">
              {format(new Date(empresa.fechaUltimoPago), "dd MMM yyyy", {
                locale: es,
              })}
            </p>
          </div>
        )}
        {empresa?.fechaProximoVencimiento && (
          <div
            className={`rounded-lg p-4 ${estaProximoAVencer ? "bg-orange-100" : "bg-white"}`}
          >
            <p className="text-xs text-gray-600 uppercase tracking-wide">
              Próximo vencimiento
            </p>
            <p
              className={`text-lg font-bold ${estaProximoAVencer ? "text-orange-600" : "text-gray-800"}`}
            >
              {format(
                new Date(empresa.fechaProximoVencimiento),
                "dd MMM yyyy",
                { locale: es }
              )}
            </p>
          </div>
        )}
      </div>

      {estaProximoAVencer && (
        <p className="text-sm text-orange-700 bg-orange-50 rounded-lg p-3 border border-orange-200">
          ⚠️ Tu suscripción vence en los próximos 7 días. Renuévala para
          mantener el acceso sin interrupciones.
        </p>
      )}
      {/* Botones de acción */}
      <div className="mt-4 flex gap-3">
        <button
          onClick={() => onCancel && onCancel()}
          disabled={isCancelling}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-60"
        >
          {isCancelling ? "Cancelando..." : "Cancelar suscripción"}
        </button>
      </div>
    </div>
  );
};

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

  // Mutación para cancelar la suscripción
  const { mutate: mutateCancel, isPending: isCancelPending } = useMutation({
    mutationFn: cancelSubscription,
    onSuccess: (res) => {
      if (res.ok) {
        toast.success("Suscripción cancelada correctamente.");
        queryClient.invalidateQueries({ queryKey: ["subscription-info"] });
      } else {
        toast.error(res.error || "No se pudo cancelar la suscripción.");
      }
    },
    onError: (err) => {
      console.error(err);
      toast.error("Error al cancelar la suscripción.");
    },
  });

  // Local state for confirmation modal when cancelling
  const [showCancelConfirm, setShowCancelConfirm] = React.useState(false);

  const handleSelectPlan = (planId: string) => {
    // Redirect to dedicated change route where user confirms the change
    router.push(
      `/admin/suscripcion/change?planId=${encodeURIComponent(planId)}`
    );
  };

  if (isSubscriptionPending) {
    return (
      <div className="text-center text-gray-500 p-8">
        Cargando planes y suscripción...
      </div>
    );
  }

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

      {/* Sección de estado actual mejorada con barra de progreso */}
      <StatusCard
        empresa={empresa}
        onCancel={() => setShowCancelConfirm(true)}
        isCancelling={isCancelPending}
      />

      {/* Confirm modal for cancellation */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-2">Confirmar cancelación</h3>
            <p className="text-sm text-gray-600 mb-4">
              ¿Estás seguro de que deseas cancelar la suscripción? Esta acción
              suspenderá la cuenta y detendrá cobros futuros.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded border"
                onClick={() => setShowCancelConfirm(false)}
              >
                Volver
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded"
                onClick={async () => {
                  await mutateCancel();
                  setShowCancelConfirm(false);
                }}
              >
                Confirmar cancelación
              </button>
            </div>
          </div>
        </div>
      )}

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
