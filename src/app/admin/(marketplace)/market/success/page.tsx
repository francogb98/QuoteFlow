import { CheckCircle, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SuccessKeyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-green-100 w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Clave Creada con Éxito</h1>
              <p className="text-emerald-100 text-sm">
                Tu nueva clave ha sido generada correctamente
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-gray-800">
              ¡Operación completada!
            </h3>
            <p className="text-gray-600">
              La clave ha sido creada y configurada correctamente en el sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
