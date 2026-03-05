"use client";
import { X } from "lucide-react";
import { FormEditUser } from "./FormEditUser"; // Ajusta la ruta

export function UserSidePanel({ userId, onClose, tarifasDisponibles }: any) {
  return (
    <>
      {/* Backdrop: cierra al hacer clic fuera */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] transition-opacity"
        onClick={onClose}
      />

      {/* Panel Lateral */}
      <aside className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-[70] flex flex-col animate-in slide-in-from-right duration-300 ease-in-out">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-semibold text-gray-600 uppercase tracking-tight">
              Detalle del Miembro
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <FormEditUser id={userId} tarifasDisponibles={tarifasDisponibles} />
        </div>
      </aside>
    </>
  );
}
