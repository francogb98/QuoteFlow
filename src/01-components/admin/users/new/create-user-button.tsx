"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserCreationModal } from "./user-creation-modal";

interface CreateUserButtonProps {
  administradorId: string;
  configuracionTarifa?: any;
  tarifasDisponibles: Array<any>;
  isDynamicTariff: boolean;
}

export const CreateUserButton = ({
  administradorId,
  configuracionTarifa,
  tarifasDisponibles,
  isDynamicTariff,
}: CreateUserButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
      >
        <UserPlus className="w-5 h-5" />
        Crear Usuarios
      </Button>

      <UserCreationModal
        administradorId={administradorId}
        configuracionTarifa={configuracionTarifa}
        tarifasDisponibles={tarifasDisponibles}
        isDynamicTariff={isDynamicTariff}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
