import Link from "next/link";
import { AlertTriangle, Settings, CreditCard } from "lucide-react";
import { AlertMessage } from "@/components/admin/tarifas/ui/alert-message";

interface NotAllowedProps {
  missingTariff?: boolean;
  missingMercadoPago?: boolean;
}

export function NotAllowed({
  missingTariff = false,
  missingMercadoPago = false,
}: NotAllowedProps = {}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Configuración Incompleta
          </h2>
          <p className="text-gray-600">
            Necesitas completar la configuración antes de poder gestionar
            usuarios.
          </p>
        </div>

        {/* Alertas específicas */}
        <div className="space-y-4">
          {(missingTariff || (!missingTariff && !missingMercadoPago)) && (
            <AlertMessage
              type="warning"
              title="Configuración de tarifas faltante"
              description="Debes configurar las tarifas para poder crear usuarios y generar pagos."
            />
          )}

          {(missingMercadoPago || (!missingTariff && !missingMercadoPago)) && (
            <AlertMessage
              type="warning"
              title="Integración con MercadoPago faltante"
              description="Debes conectar tu cuenta de MercadoPago para procesar pagos."
            />
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {(missingTariff || (!missingTariff && !missingMercadoPago)) && (
            <Link
              href="/configuraciones"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Settings className="w-5 h-5" />
              Configurar Tarifas
            </Link>
          )}

          {(missingMercadoPago || (!missingTariff && !missingMercadoPago)) && (
            <Link
              href="/configuraciones/mercadopago"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <CreditCard className="w-5 h-5" />
              Conectar MercadoPago
            </Link>
          )}
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 text-blue-600 mt-0.5">
              <AlertTriangle className="w-full h-full" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 mb-1">
                ¿Por qué necesito esto?
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  • <strong>Tarifas:</strong> Define cuánto cobrar a cada
                  usuario
                </li>
                <li>
                  • <strong>MercadoPago:</strong> Permite procesar pagos
                  automáticamente
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
