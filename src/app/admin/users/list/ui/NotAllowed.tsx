"use client";

import { Plus, AlertTriangle, Settings } from "lucide-react";
import Link from "next/link";

function NotAllowed() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-amber-200 p-6 max-w-md mx-auto">
      <div className="text-center">
        {/* Icono de advertencia */}
        <div className="w-16 h-16 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
        </div>

        {/* Título y descripción */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Configuración requerida
        </h3>
        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
          Antes de crear usuarios, necesitas configurar tus tarifas y métodos de
          pago.
        </p>

        {/* Botones de acción */}
        <div className="space-y-3">
          {/* Botón deshabilitado */}
          <button
            disabled
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-300 text-gray-500 font-medium rounded-lg cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Usuario</span>
          </button>

          {/* Botón para ir a configuración */}
          <Link
            href="/admin/settings"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300"
          >
            <Settings className="w-4 h-4" />
            <span>Configurar Tarifas</span>
          </Link>
        </div>

        {/* Información adicional */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start text-left">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
              <span className="text-white text-xs font-bold">i</span>
            </div>
            <div>
              <p className="text-sm text-blue-800 font-medium mb-1">
                ¿Qué necesitas configurar?
              </p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Planes de suscripción y precios</li>
                <li>• Métodos de pago (Mercado Pago)</li>
                <li>• Configuración de facturación</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotAllowed;
