"use client";

import { useState } from "react";
import { User, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormCreateUser } from "./FormCreateUser";
import { BulkUserForm } from "./bulk-user-form";

interface UserCreationModalProps {
  administradorId: string;
  configuracionTarifa?: any;
  tarifasDisponibles: Array<any>;
  isDynamicTariff: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export const UserCreationModal = ({
  administradorId,
  configuracionTarifa,
  tarifasDisponibles,
  isDynamicTariff,
  isOpen,
  onClose,
}: UserCreationModalProps) => {
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");

  if (!isOpen) return null;

  const handleSuccess = () => {
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000 p-4 max-h-screen">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Crear Usuarios</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setActiveTab("single")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "single"
                ? "border-purple-500 text-purple-600 bg-purple-50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <User className="w-4 h-4" />
            Usuario Individual
          </button>
          <button
            onClick={() => setActiveTab("bulk")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "bulk"
                ? "border-blue-500 text-blue-600 bg-blue-50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Users className="w-4 h-4" />
            Carga Masiva
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {activeTab === "single" ? (
            <FormCreateUser
              administradorId={administradorId}
              configuracionTarifa={configuracionTarifa}
              tarifasDisponibles={tarifasDisponibles}
              onSuccess={handleSuccess}
              isDynamicTariff={isDynamicTariff}
            />
          ) : (
            <BulkUserForm
              administradorId={administradorId}
              configuracionTarifa={configuracionTarifa}
              tarifasDisponibles={tarifasDisponibles}
              onSuccess={handleSuccess}
              isDynamicTariff={isDynamicTariff}
            />
          )}
        </div>
      </div>
    </div>
  );
};
