"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TipoPlanEmpresa, FrecuenciaPago } from "@prisma/client";
import { PersonalInfoForm } from "./PersonalInfoForm";
import { PlanSelection } from "./PlanSelection";
import { type PlanOption, plans } from "@/lib";
import { prepareRegistrationForPayment } from "@/01-actions/auth/registration/01-prepareRegistration";
import { PromoCodeField } from "./PromoCodeField";
import { createTrialAccount as createTrialAccountAction } from "@/01-actions/auth/registration/05-createTrialAccount";

interface RegisterFormData {
  nombre: string;
  documento: string;
  email: string;
  nombreEmpresa: string;
  password: string;
  confirm_password: string;
  telefono: string;
}

export const RegisterForm = () => {
  const router = useRouter();
  const [selectedPlanId, setSelectedPlanId] =
    useState<PlanOption["id"]>("basico_mensual");
  const [formError, setFormError] = useState<{
    field?: string;
    message: string;
  } | null>(null);
  const [validPromoCode, setValidPromoCode] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const createTrialAccount = useMutation({
    mutationFn: createTrialAccountAction,
    onSuccess: (data) => {
      if (data.success) {
        setSuccess(true);
        setSuccessMessage("¡Cuenta de prueba creada exitosamente!");
        setFormError(null);

        // Redirigir después de mostrar el éxito
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        setFormError({
          message: data.error || "Error al crear la cuenta de prueba",
        });
      }
    },
    onError: (error: any) => {
      setFormError({
        message:
          error.message || "Error inesperado al crear la cuenta de prueba",
      });
    },
  });

  const prepareRegistration = useMutation({
    mutationFn: prepareRegistrationForPayment,
    onSuccess: (data) => {
      if (data.success && data.tempRegistrationId) {
        setSuccess(true);
        setSuccessMessage(
          "¡Registro preparado correctamente! Redirigiendo al pago..."
        );
        setFormError(null);

        // Pequeña pausa antes de redirigir
        setTimeout(() => {
          router.push(`/auth/register-payment/${data.tempRegistrationId}`);
        }, 1500);
      } else if (data.error) {
        setFormError(data.error);
        if (data.error.field) {
          setError(data.error.field as keyof RegisterFormData, {
            type: "manual",
            message: data.error.message,
          });
        }
      }
    },
    onError: (error: any) => {
      setFormError({
        message: error.message || "Ocurrió un error inesperado",
      });
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setFormError(null);
    setSuccess(false);
    clearErrors();

    // Validación de confirmación de contraseña
    if (data.password !== data.confirm_password) {
      setError("confirm_password", {
        type: "manual",
        message: "Las contraseñas no coinciden",
      });
      return;
    }

    // Si hay código promocional válido, crear cuenta de prueba
    if (validPromoCode) {
      const trialData = {
        nombre: data.nombre,
        documento: data.documento,
        email: data.email,
        nombreEmpresa: data.nombreEmpresa,
        password: data.password,
        telefono: data.telefono,
        codigoPromocional: validPromoCode,
      };
      //@ts-ignore
      await createTrialAccount.mutateAsync(trialData);
      return;
    }

    const selectedPlan = plans.find((p) => p.id === selectedPlanId);
    if (!selectedPlan) {
      setFormError({ message: "Plan no seleccionado o inválido" });
      return;
    }

    let planTipoToSend: TipoPlanEmpresa;
    let frecuenciaPagoToSend: FrecuenciaPago;

    if (selectedPlanId.startsWith("basico")) {
      planTipoToSend = TipoPlanEmpresa.BASICO;
    } else {
      planTipoToSend = TipoPlanEmpresa.PRO;
    }

    if (selectedPlanId.endsWith("mensual")) {
      frecuenciaPagoToSend = FrecuenciaPago.MENSUAL;
    } else {
      frecuenciaPagoToSend = FrecuenciaPago.ANUAL;
    }

    const contentToPrepare = {
      nombre: data.nombre,
      documento: data.documento,
      email: data.email,
      nombreEmpresa: data.nombreEmpresa,
      password: data.password,
      telefono: data.telefono,
      planTipo: planTipoToSend,
      frecuenciaPago: frecuenciaPagoToSend,
    };

    await prepareRegistration.mutateAsync(contentToPrepare);
  };

  const handlePlanSelect = (planId: PlanOption["id"]) => {
    setSelectedPlanId(planId);
  };

  const handleValidPromoCode = (codigo: string) => {
    setValidPromoCode(codigo);
  };

  const handleInvalidPromoCode = () => {
    setValidPromoCode(null);
  };

  const isLoading =
    prepareRegistration.isPending || createTrialAccount.isPending;

  return (
    <div className="space-y-8">
      {/* Alerta de éxito */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-start animate-in slide-in-from-top-2">
          <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-medium text-sm">{successMessage}</div>
            <div className="text-sm opacity-90 mt-1">
              {validPromoCode
                ? "Accediendo a tu cuenta..."
                : "Preparando página de pago..."}
            </div>
          </div>
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <PersonalInfoForm
          register={register}
          errors={errors}
          watch={watch}
          //@ts-ignore
          disabled={isLoading || success}
        />

        <PromoCodeField
          onValidCode={handleValidPromoCode}
          onInvalidCode={handleInvalidPromoCode}
          disabled={isLoading || success}
        />

        {!validPromoCode && (
          <PlanSelection
            plans={plans}
            selectedPlanId={selectedPlanId}
            onSelectPlan={handlePlanSelect}
            //@ts-ignore
            disabled={isLoading || success}
          />
        )}

        {validPromoCode && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">¡Código promocional aplicado!</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              Tendrás acceso completo por 2 meses sin costo.
            </p>
          </div>
        )}

        {/* Alerta de error general */}
        <div className="space-y-2">
          {/* Error general (como antes) */}
          {formError && !formError.field && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{formError.message}</span>
            </div>
          )}

          {/* Errores de campo (nuevo) */}
          {Object.entries(errors).length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
              <ul className="space-y-1">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field} className="flex items-start">
                    <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{error.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading || success}
          className={`w-full py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg ${
            success
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
          } text-white`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              {validPromoCode
                ? "Creando cuenta de prueba..."
                : "Preparando registro..."}
            </>
          ) : success ? (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              {validPromoCode
                ? "¡Cuenta creada! Redirigiendo..."
                : "¡Éxito! Redirigiendo al pago..."}
            </>
          ) : (
            <>
              {validPromoCode
                ? "Crear Cuenta de Prueba Gratis"
                : `Continuar al Pago - ${
                    plans.find((p: any) => p.id === selectedPlanId)?.name
                  }`}
            </>
          )}
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-purple-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white/80 text-gray-500 rounded-full">
              O
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full border-purple-200 text-purple-600 hover:bg-purple-50 py-3 rounded-xl font-medium transition-all duration-200 hover:border-purple-300 bg-transparent"
          disabled={isLoading || success}
          asChild
        >
          <Link href="/auth/login">Ya tengo cuenta - Iniciar Sesión</Link>
        </Button>
      </form>
    </div>
  );
};
