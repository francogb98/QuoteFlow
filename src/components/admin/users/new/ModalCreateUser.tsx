"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { FormCreateUser } from "./FormCreateUser";

interface ModalCreateUserProps {
  administradorId: string;
  tarifasDisponibles: Array<any>;
  isDynamicTariff: boolean;
}

export const ModalCreateUser = ({
  administradorId,
  tarifasDisponibles,
  isDynamicTariff,
}: ModalCreateUserProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Botón para abrir el modal */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => setIsOpen(true)}
          className={`font-medium ms-auto px-6 py-3 rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 ${"bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"}`}
        >
          <Plus className="w-5 h-5" />
          <span>Agregar Usuario</span>
        </button>
      </div>

      {/* Modal */}
      {isOpen && (
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
                  onSuccess={handleClose}
                  tarifasDisponibles={tarifasDisponibles}
                  isDynamicTariff={isDynamicTariff}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
