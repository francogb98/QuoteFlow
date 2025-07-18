"use client"; // Es crucial que esta página siga siendo un Client Component

import { Suspense } from "react";
import { IoReloadCircle } from "react-icons/io5";
import { SuccessContent } from "./ui/success-content"; // Importa el nuevo componente

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <IoReloadCircle className="mx-auto h-12 w-12 animate-spin text-blue-500" />
            <p className="mt-4 text-lg font-medium text-gray-700">
              Cargando detalles del pago...
            </p>
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
