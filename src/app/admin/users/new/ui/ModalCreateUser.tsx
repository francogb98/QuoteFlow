"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { FormCreate } from "./FormCreate";

export const ModalCreateUser = ({
  administradorId,
}: {
  administradorId: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Botón para abrir el modal */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
      >
        <Plus className="w-5 h-5" />
        <span>Agregar Usuario</span>
      </button>

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
                <FormCreate
                  administradorId={administradorId}
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
