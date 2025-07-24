import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Props {
  params: Promise<{
    payment_id: string;
    status: string;
    preference_id: string;
  }>;
}

export default async function FailurePage({ params }: Props) {
  const {
    payment_id: paymentId,
    status,
    preference_id: preferenceId,
  } = await params;

  const paymentData = {
    paymentId,
    status,
    preferenceId,
    date: new Date().toLocaleDateString("es-AR"),
    time: new Date().toLocaleTimeString("es-AR"),
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8 text-center bg-red-50">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-red-900 mb-2">
              Pago no completado
            </h1>
            <p className="text-lg text-red-700">
              No pudimos procesar tu pago. Por favor, intenta nuevamente.
            </p>
          </div>

          <div className="p-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-red-900 mb-2">
                Posibles causas:
              </h3>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Fondos insuficientes</li>
                <li>• Datos de tarjeta incorrectos</li>
                <li>• Transacción cancelada por el usuario</li>
                <li>• Problemas temporales con el procesador de pagos</li>
              </ul>
            </div>

            {paymentData && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-3">
                  Detalles del intento:
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID de transacción:</span>
                    <span className="font-mono">
                      {paymentData.paymentId || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <span className="text-red-600 font-medium">
                      {paymentData.status || "Fallido"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha:</span>
                    <span>{paymentData.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hora:</span>
                    <span>{paymentData.time}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">
                ¿Qué puedes hacer?
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Intentar nuevamente
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="w-full bg-transparent"
                >
                  <Link href="/" className="flex items-center justify-center">
                    <Home className="w-4 h-4 mr-2" />
                    Volver al inicio
                  </Link>
                </Button>
              </div>
            </div>

            <div className="mt-8 text-center text-sm text-gray-500 border-t border-gray-200 pt-6">
              <p>
                ¿Necesitas ayuda?{" "}
                <a
                  href="mailto:soporte@tudominio.com"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Contáctanos
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
