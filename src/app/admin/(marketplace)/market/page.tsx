import { ExternalLink, CreditCard, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/01-actions/payment/marketPlace.connect";

export default async function MercadoPagoConnectionPage() {
  const authorizationUrl = await api.user.authorize();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-purple-100 w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Conectar MercadoPago</h1>
              <p className="text-blue-100 text-sm">
                Integra tu cuenta para recibir pagos automáticamente
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Pagos seguros y confiables</span>
            </div>
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Procesamiento automático</span>
            </div>
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Soporte 24/7</span>
            </div>
          </div>

          <Button
            asChild
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <a
              href={authorizationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Conectar con MercadoPago
            </a>
          </Button>

          <p className="text-sm text-gray-500 text-center">
            Serás redirigido al sitio seguro de MercadoPago
          </p>
        </div>
      </div>
    </div>
  );
}
