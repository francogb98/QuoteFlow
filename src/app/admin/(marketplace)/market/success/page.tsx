"use client";

import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";

export default function MercadoPagoSuccessPage() {
  useEffect(() => {
    // Enviar mensaje a la ventana padre
    if (window.opener) {
      window.opener.postMessage(
        {
          type: "MERCADOPAGO_SUCCESS",
          timestamp: Date.now(),
        },
        window.location.origin
      );

      // Cerrar la ventana después de un breve delay
      setTimeout(() => {
        window.close();
      }, 2000);
    } else {
      // Si no hay ventana padre, redirigir al dashboard
      setTimeout(() => {
        window.location.href = "/admin/dashboard";
      }, 3000);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Conexión Exitosa!
          </h1>
          <p className="text-gray-600 mb-4">
            MercadoPago se ha conectado correctamente a tu cuenta.
          </p>
          <div className="flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            <span className="text-sm text-gray-500">Cerrando ventana...</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
