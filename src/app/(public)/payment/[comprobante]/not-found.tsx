"use client";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-purple-100 p-8">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Comprobante no encontrado
          </h1>

          <p className="text-gray-600 mb-6">
            El comprobante que buscas no existe o no está disponible. Verifica
            el enlace e intenta nuevamente.
          </p>

          <div className="space-y-3">
            <Button
              asChild
              className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
