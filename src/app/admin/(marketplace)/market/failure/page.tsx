"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, X } from "lucide-react";
import { useEffect } from "react";

export default function MercadoPagoFailurePage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("message") || "Error desconocido";

  useEffect(() => {
    // Enviar mensaje de error a la ventana padre
    if (window.opener) {
      window.opener.postMessage(
        {
          type: "MERCADOPAGO_ERROR",
          error: decodeURIComponent(error),
        },
        window.location.origin
      );
    }
  }, [error]);

  const handleClose = () => {
    if (window.opener) {
      window.close();
    } else {
      window.location.href = "/admin/home";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Error de Conexión
          </h1>
          <p className="text-gray-600 mb-4">
            No se pudo conectar con MercadoPago:
          </p>
          <p className="text-sm text-red-600 mb-6 bg-red-50 p-3 rounded">
            {decodeURIComponent(error)}
          </p>
          <Button onClick={handleClose} className="w-full">
            <X className="w-4 h-4 mr-2" />
            Cerrar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
