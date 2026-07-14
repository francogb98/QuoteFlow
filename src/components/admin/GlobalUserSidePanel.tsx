"use client";

import { X } from "lucide-react";
import { FormEditUser } from "@/components/admin/users/ui/FormEditUser";
import { useTarifas } from "@/lib/hooks/useTarifas";
import { Button } from "@/components/ui/button";

interface GlobalUserSidePanelProps {
  userId: string | null;
  onClose: () => void;
  title?: string;
}

export function GlobalUserSidePanel({
  userId,
  onClose,
  title = "Detalle del Miembro",
}: GlobalUserSidePanelProps) {
  const { tarifa } = useTarifas();

  if (!userId) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Panel */}
      <aside className="fixed inset-y-0 right-0 w-full max-w-2xl bg-background shadow-2xl z-[60] flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-4 border-b flex justify-between items-center bg-muted/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm font-semibold text-muted-foreground uppercase">
              {title}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
            aria-label="Cerrar panel"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <FormEditUser
            id={userId}
            tarifasDisponibles={tarifa ? [tarifa] : []}
          />
        </div>
      </aside>
    </>
  );
}
