"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TipoPlanEmpresa, FrecuenciaPago } from "@prisma/client";

import { PlanSelection } from "./PlanSelection";
import { PersonalInfoForm } from "./PersonalInfoForm";
import { PromoCodeField } from "./PromoCodeField";

import { prepareRegistrationForPayment } from "@/actions/auth/registration/01-prepareRegistration";
import { createTrialAccount as createTrialAccountAction } from "@/actions/auth/registration/05-createTrialAccount";
import { PlanOption, plans } from "@/lib/plans/data";

interface RegisterFormData {
  nombre: string;
  documento: string;
  email: string;
  nombreEmpresa: string;
  telefono: string;
  password: string;
  confirm_password: string;
  planTipo?: TipoPlanEmpresa;
  frecuenciaPago?: FrecuenciaPago;
}

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    defaultValues: {
      nombre: "",
      documento: "",
      email: "",
      nombreEmpresa: "",
      telefono: "",
      password: "",
      confirm_password: "",
    },
  });

  const searchParams = useSearchParams();
  const tempId = searchParams?.get("tempId");
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

  useEffect(() => {
    const planIdParam = searchParams?.get("planId");
    const tipoPlanParam = searchParams?.get("tipoPlan"); // Por si usas este también

    // 1. Prioridad: parámetro planId exacto (ej: ?planId=pro_anual)
    if (planIdParam && plans.some((p) => p.id === planIdParam)) {
      setSelectedPlanId(planIdParam as PlanOption["id"]);
      return;
    }

    // 2. Alternativa: parámetro tipoPlan (ej: ?tipoPlan=pro)
    // Si viene solo el tipo, seleccionamos la versión mensual por defecto
    if (tipoPlanParam) {
      if (tipoPlanParam === "pro" || tipoPlanParam === "PRO") {
        setSelectedPlanId("pro_mensual");
      } else if (tipoPlanParam === "basico" || tipoPlanParam === "BASICO") {
        setSelectedPlanId("basico_mensual");
      }
    }
  }, [searchParams]);

  // --- Mutations ---
  const createTrialAccount = useMutation({
    mutationFn: createTrialAccountAction,
    onSuccess: (data) => {
      if (data.success) {
        setSuccess(true);
        setSuccessMessage("¡Cuenta de prueba creada exitosamente!");
        setFormError(null);
        setTimeout(() => router.push("/admin/home"), 2000);
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
      if (data.success && data.data?.tempRegistrationId) {
        setSuccess(true);
        setSuccessMessage(
          "¡Registro preparado correctamente! Redirigiendo al pago...",
        );
        setFormError(null);
        setTimeout(
          () =>
            router.push(
              `/auth/register-payment/${data.data!.tempRegistrationId}`,
            ),
          1500,
        );
      } else if (data.error) {
        setFormError({ message: data.error });
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

    // Validación de confirmación de contraseña
    if (data.password !== data.confirm_password) {
      setError("confirm_password", {
        type: "manual",
        message: "Las contraseñas no coinciden",
      });
      return;
    }

    // Si hay código promocional válido →’ cuenta de prueba
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
      await createTrialAccount.mutateAsync(trialData);
      return;
    }

    // Selección de plan
    const selectedPlan = plans.find((p) => p.id === selectedPlanId);
    if (!selectedPlan) {
      setFormError({ message: "Plan no seleccionado o inválido" });
      return;
    }

    const planTipoToSend: TipoPlanEmpresa = selectedPlanId.startsWith("basico")
      ? TipoPlanEmpresa.BASICO
      : TipoPlanEmpresa.PRO;

    const frecuenciaPagoToSend: FrecuenciaPago = selectedPlanId.endsWith(
      "mensual",
    )
      ? FrecuenciaPago.MENSUAL
      : FrecuenciaPago.ANUAL;

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

  // --- Handlers ---
  const handlePlanSelect = (planId: PlanOption["id"]) =>
    setSelectedPlanId(planId);
  const handleValidPromoCode = (codigo: string) => setValidPromoCode(codigo);
  const handleInvalidPromoCode = () => setValidPromoCode(null);

  const isLoading =
    prepareRegistration.isPending || createTrialAccount.isPending;

  // --- Cargar datos de registro temporal ---
  useEffect(() => {
    if (!tempId) return;
    let mounted = true;

    fetch(`/api/temp-registration/${tempId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!mounted || data?.error) return;
        setValue("nombre", data.nombre ?? "");
        setValue("documento", data.documento ?? "");
        setValue("email", data.email ?? "");
        setValue("nombreEmpresa", data.nombreEmpresa ?? "");
        setValue("telefono", data.telefono ?? "");
      })
      .catch((err) =>
        console.error("[RegisterForm] Error fetching temp registration:", err),
      );

    return () => {
      mounted = false;
    };
  }, [tempId, setValue]);

  // --- Render ---
  return (
    <div className="space-y-8">
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

        {/* Errores */}
        <div className="space-y-2">
          {formError && !formError.field && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{formError.message}</span>
            </div>
          )}

          {Object.entries(errors).length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
              <ul className="space-y-1">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field} className="flex items-start">
                    <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{error?.message}</span>
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
                : "¡Ñ‰xito! Redirigiendo al pago..."}
            </>
          ) : (
            <>
              {validPromoCode
                ? "Crear Cuenta de Prueba Gratis"
                : `Continuar al Pago - ${
                    plans.find((p) => p.id === selectedPlanId)?.name || ""
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
}
