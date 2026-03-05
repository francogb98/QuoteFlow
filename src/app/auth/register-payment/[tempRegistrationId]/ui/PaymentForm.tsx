"use client";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { handleSuscriber } from "@/01-actions/payment/suscripcion-payment";

interface PaymentFormProps {
  transactionAmount: number;
  selectedPlan: {
    id: string;
    name: string;
    price: string;
    period: string;
    features: string[];
    originalPrice?: string;
  };
  tempRegistration: {
    id: string;
    email: string;
    nombreEmpresa: string;
    planTipo: string;
    frecuenciaPago: string;
  };
}

export function PaymentForm({
  transactionAmount,
  selectedPlan,
  tempRegistration,
}: PaymentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (
        typeof transactionAmount !== "number" ||
        transactionAmount <= 0 ||
        isNaN(transactionAmount)
      ) {
        throw new Error("Monto de transacción inválido.");
      }

      // Guardar tempRegistrationId en sessionStorage antes de redirigir
      sessionStorage.setItem("tempRegistrationId", tempRegistration.id);

      const suscriberResponse = await handleSuscriber({
        empresaId: tempRegistration.id,
        adminEmail: tempRegistration.email,
        transactionAmount: transactionAmount,
        planName: selectedPlan.name,
        frecuenciaPago: tempRegistration.frecuenciaPago as any,
        planTipo: tempRegistration.planTipo as any,
      });

      if (suscriberResponse.redirectUrl) {
        setSuccess(true);

        startTransition(() => {
          window.location.href = suscriberResponse.redirectUrl!;
        });
      } else {
        setError(suscriberResponse.error || "Error al iniciar el pago.");
      }
    } catch (err: any) {
      setError(err.message || "Error inesperado al procesar el pago.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Alerta de error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-medium text-sm">Error al procesar el pago</div>
            <div className="text-sm opacity-90 mt-1">{error}</div>
          </div>
        </div>
      )}

      {/* Alerta de éxito */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-start animate-in slide-in-from-top-2">
          <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-medium text-sm">
              ¡Pago iniciado correctamente!
            </div>
            <div className="text-sm opacity-90 mt-1">
              Redirigiendo a Mercado Pago...
            </div>
          </div>
        </div>
      )}

      <Button
        onClick={handlePayment}
        disabled={isLoading || success || isPending}
        className={`w-full py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg ${
          success
            ? "bg-green-600 hover:bg-green-700"
            : "bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
        } text-white`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Procesando pago...
          </>
        ) : success ? (
          <>
            <CheckCircle className="w-5 h-5 mr-2" />
            ¡Éxito! Redirigiendo...
          </>
        ) : (
          "Pagar con Mercado Pago"
        )}
      </Button>
    </div>
  );
}
