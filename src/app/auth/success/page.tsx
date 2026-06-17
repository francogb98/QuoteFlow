"use client";

import { CheckCircle, Loader2, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface StatusResponse {
  ok: boolean;
  tempRegistration?: {
    id: string;
    email: string;
    nombreEmpresa: string;
    planTipo: string;
    frecuenciaPago: string;
  };
  empresa?: {
    id: string;
    nombre: string;
    planTipo: string;
    frecuenciaPago: string;
    estaActiva: boolean;
    estadoPago: string;
    fechaProximoVencimiento: Date | null;
    fechaUltimoPago: Date | null;
  };
  admin?: {
    id: string;
    email: string;
  };
  isComplete: boolean;
}

type StatusState = "loading" | "active" | "pending" | "error" | "not_found";

export default function RegistrationSuccessPage() {
  const router = useRouter();
  const [statusState, setStatusState] = useState<StatusState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [empresaData, setEmpresaData] = useState<
    StatusResponse["empresa"] | null
  >(null);

  const POLL_INTERVAL = 3000; // 3 segundos
  const MAX_POLLS = 10; // 30 segundos total (10 * 3)

  useEffect(() => {
    const tempRegistrationId = sessionStorage.getItem("tempRegistrationId");

    if (!tempRegistrationId) {
      setStatusState("not_found");
      setError(
        "No se encontró información del registro. Por favor, inicia el proceso de registro nuevamente.",
      );
      return;
    }

    let intervalId: NodeJS.Timeout | null = null;
    let isMounted = true;

    const checkStatus = async () => {
      try {
        const response = await fetch(
          `/api/temp-registration/${tempRegistrationId}/status`,
        );

        if (!response.ok) {
          console.error(`[AUTH SUCCESS] Error en response: ${response.status}`);
          if (response.status === 404) {
            if (isMounted) {
              setStatusState("not_found");
              setError(
                "El registro temporal ha expirado o no existe. Por favor, inicia el proceso de registro nuevamente.",
              );
            }
          } else {
            throw new Error("Error al consultar el estado del registro");
          }
          return;
        }

        const data: StatusResponse = await response.json();

        if (!isMounted) return;

        if (data.isComplete && data.empresa?.estaActiva) {
          // Suscripción activa correctamente
          setStatusState("active");
          setEmpresaData(data.empresa);
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
          // Limpiar sessionStorage después de éxito
          sessionStorage.removeItem("tempRegistrationId");
        } else if (pollCount >= MAX_POLLS - 1) {
          // Se alcanzó el máximo de intentos sin activación
          setStatusState("pending");
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        } else {
          // Continuar polling
          setPollCount((prev) => prev + 1);
        }
      } catch (err) {
        console.error(
          "[AUTH SUCCESS] Error checking subscription status:",
          err,
        );
        if (isMounted) {
          setStatusState("error");
          setError(
            "Error al verificar el estado de tu suscripción. Por favor, intenta nuevamente.",
          );
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        }
      }
    };

    // Iniciar polling
    checkStatus();
    intervalId = setInterval(checkStatus, POLL_INTERVAL);

    // Cleanup
    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [pollCount]);

  if (statusState === "loading") {
    return (
      <div className="w-full max-w-md mx-auto py-12">
        <div className="bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl p-8 border border-gray-100 text-center">
          <Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Estamos procesando tu suscripción...
          </h1>
          <p className="text-gray-600">
            Esto puede tardar unos segundos. Por favor, espera un momento.
          </p>
        </div>
      </div>
    );
  }

  if (statusState === "active") {
    return (
      <div className="w-full max-w-md mx-auto py-12">
        <div className="bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl p-8 border border-green-100 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            ¡Suscripción Activada Correctamente!
          </h1>
          <p className="text-gray-700 mb-2">
            Tu cuenta ha sido creada y tu suscripción está activa.
          </p>
          {empresaData && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-semibold">Empresa:</span>{" "}
                {empresaData.nombre}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-semibold">Plan:</span>{" "}
                {empresaData.planTipo}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Frecuencia:</span>{" "}
                {empresaData.frecuenciaPago}
              </p>
            </div>
          )}
          <p className="text-gray-700 mb-6">
            Ya puedes iniciar sesión para comenzar a gestionar tu gimnasio.
          </p>
          <Button
            asChild
            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Link href="/auth/login">Ir a Iniciar Sesión</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (statusState === "pending") {
    return (
      <div className="w-full max-w-md mx-auto py-12">
        <div className="bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl p-8 border border-yellow-100 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Tu pago está siendo procesado
          </h1>
          <p className="text-gray-700 mb-6">
            Te notificaremos cuando tu suscripción esté activa.
            <br />
            Mientras tanto, puedes intentar iniciar sesión más tarde.
          </p>
          <Button
            asChild
            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Link href="/auth/login">Ir a Iniciar Sesión</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (statusState === "not_found" || statusState === "error") {
    return (
      <div className="w-full max-w-md mx-auto py-12">
        <div className="bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl p-8 border border-red-100 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error en el Proceso
          </h1>
          <p className="text-gray-700 mb-6">
            {error || "Ocurrió un error inesperado."}
          </p>
          <Button
            asChild
            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Link href="/auth/new-account">Iniciar Registro Nuevamente</Link>
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
