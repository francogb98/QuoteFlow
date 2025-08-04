"use client";

import { useState } from "react";
import { Plus, X, Settings } from "lucide-react";
import { FormCreateUser } from "./FormCreateUser";
import Link from "next/link";
import { AlertMessage } from "@/components/admin/tarifas/ui/alert-message";

interface ModalCreateUserProps {
  administradorId: string;
  tariffInfo: {
    hasConfiguration: boolean;
    isValid: boolean;
    errors: string[];
    configuracion?: any;
    tipo?: string;
    message?: string;
  };
}

export const ModalCreateUser = ({
  administradorId,
  tariffInfo,
}: ModalCreateUserProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  const canCreateUsers = tariffInfo.hasConfiguration && tariffInfo.isValid;

  return (
    <>
      {/* Botón para abrir el modal */}
      <div className="hidden sm:flex flex-col items-center gap-4">
        <button
          onClick={() => setIsOpen(true)}
          disabled={!canCreateUsers}
          className={`font-medium px-6 py-3 rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 mx-auto ${
            canCreateUsers
              ? "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <Plus className="w-5 h-5" />
          <span>Agregar Usuario</span>
        </button>

        {/* Mostrar advertencias si no se puede crear usuarios */}
        {!canCreateUsers && (
          <div className="w-full max-w-2xl">
            {!tariffInfo.hasConfiguration ? (
              <AlertMessage
                type="warning"
                title="Configuración de tarifas requerida"
                description="Debes configurar las tarifas antes de poder agregar usuarios."
                className="mb-4"
              />
            ) : !tariffInfo.isValid ? (
              <div className="space-y-3">
                <AlertMessage
                  type="error"
                  title="Configuración de tarifas inválida"
                  description="Tu configuración de tarifas tiene errores que deben ser corregidos."
                  className="mb-2"
                />
                {tariffInfo.errors.map((error, index) => (
                  <AlertMessage
                    key={index}
                    type="error"
                    title={error}
                    className="text-sm"
                  />
                ))}
              </div>
            ) : null}

            <div className="text-center mt-4">
              <Link
                href="/configuraciones"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Settings className="w-4 h-4" />
                {!tariffInfo.hasConfiguration
                  ? "Configurar Tarifas"
                  : "Corregir Configuración"}
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="fixed sm:hidden z-5 right-4 bottom-4">
        <button
          onClick={() => setIsOpen(true)}
          disabled={!canCreateUsers}
          className={`
        w-14 h-14 rounded-full shadow-lg transition-all duration-300
        flex items-center justify-center
        ${
          canCreateUsers
            ? "bg-gradient-to-br from-emerald-500 to-purple-600 hover:from-emerald-600 hover:to-purple-700 text-white transform hover:scale-110 active:scale-95"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }
      `}
          title="Agregar Usuario"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Modal */}
      {isOpen && canCreateUsers && (
        <div className="fixed inset-0 z-50 overflow-y-auto animate-in fade-in duration-300">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={handleClose}
          />
          {/* Modal Container */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all animate-in zoom-in-95 duration-300">
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute right-4 top-4 z-10 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <span className="sr-only">Cerrar modal</span>
                <X className="h-5 w-5" />
              </button>
              {/* Modal Content */}
              <div className="p-6">
                <FormCreateUser
                  administradorId={administradorId}
                  configuracionTarifa={tariffInfo.configuracion}
                  onSuccess={handleClose}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
