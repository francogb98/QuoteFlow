"use client";

import { useState } from "react";
import { User, Users } from "lucide-react";
import { BulkUserForm } from "./bulk-user-form";
import { FormCreateUser } from "./FormCreateUser";

interface UserCreationTabsProps {
  administradorId: string;
  configuracionTarifa?: any;
  onSuccess?: () => void;
  tarifasDisponibles: Array<any>;
  isDynamicTariff: boolean;
}

export const UserCreationTabs = ({
  administradorId,
  configuracionTarifa,
  tarifasDisponibles,
  onSuccess,
  isDynamicTariff,
}: UserCreationTabsProps) => {
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
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

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "single" ? (
          <FormCreateUser
            administradorId={administradorId}
            configuracionTarifa={configuracionTarifa}
            tarifasDisponibles={tarifasDisponibles}
            onSuccess={onSuccess}
            isDynamicTariff={isDynamicTariff}
          />
        ) : (
          <BulkUserForm
            administradorId={administradorId}
            configuracionTarifa={configuracionTarifa}
            tarifasDisponibles={tarifasDisponibles}
            onSuccess={onSuccess}
            isDynamicTariff={isDynamicTariff}
          />
        )}
      </div>
    </div>
  );
};
