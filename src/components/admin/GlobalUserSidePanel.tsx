"use client";

import { useState, useCallback } from "react";
import { X, ChevronLeft } from "lucide-react";
import { FormEditUser } from "@/components/admin/users/ui/FormEditUser";
import { InlineCreatePayment } from "@/components/admin/users/user/pagos/InlineCreatePayment";
import { InlineEditPayment } from "@/components/admin/users/user/pagos/InlineEditPayment";
import { useTarifas } from "@/lib/hooks/useTarifas";
import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/actions/users/admin/getUser";
import { Button } from "@/components/ui/button";

type PanelView = "default" | "create-payment" | "edit-payment";

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
  const [activeView, setActiveView] = useState<PanelView>("default");
  const [selectedPago, setSelectedPago] = useState<any>(null);

  const { data: userData } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUser(userId!),
    enabled: !!userId,
  });

  const handleCreatePayment = useCallback(() => {
    setActiveView("create-payment");
  }, []);

  const handleEditPayment = useCallback((pago: any) => {
    setSelectedPago(pago);
    setActiveView("edit-payment");
  }, []);

  const handleBack = useCallback(() => {
    setActiveView("default");
    setSelectedPago(null);
  }, []);

  const handlePaymentSuccess = useCallback(() => {
    setActiveView("default");
    setSelectedPago(null);
  }, []);

  if (!userId) return null;

  const viewTitle =
    activeView === "create-payment"
      ? "Nuevo Pago"
      : activeView === "edit-payment"
        ? "Confirmar Cobro"
        : title;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Panel */}
      <aside className="fixed inset-y-0 right-0 w-full max-w-2xl bg-background shadow-2xl z-[60] flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-4 border-b flex items-center gap-3 bg-muted/50">
          {activeView !== "default" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-8 w-8 shrink-0"
              aria-label="Volver al historial"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm font-semibold text-muted-foreground uppercase truncate">
              {viewTitle}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 shrink-0"
            aria-label="Cerrar panel"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeView === "default" && (
            <FormEditUser
              id={userId}
              tarifasDisponibles={tarifa ? [tarifa] : []}
              onCreatePayment={handleCreatePayment}
              onEditPayment={handleEditPayment}
            />
          )}

          {activeView === "create-payment" && (
            <InlineCreatePayment
              userId={userId}
              configuracionTarifa={userData?.configuracionTarifa}
              fechaInicioMembresia={
                userData?.fechaInicioMembresia
                  ? new Date(userData.fechaInicioMembresia)
                  : undefined
              }
              onSuccess={handlePaymentSuccess}
              onBack={handleBack}
            />
          )}

          {activeView === "edit-payment" && selectedPago && (
            <InlineEditPayment
              pago={selectedPago}
              userId={userId}
              todosLosPagosDelUsuario={
                userData?.pagos?.filter((p: any) => p.estado !== "PAGADO") ?? []
              }
              userName={userData ? `${userData.nombre} ${userData.apellido}` : undefined}
              planNombre={userData?.dinamicaTarifa?.nombre || userData?.rangoTarifa?.nombre || undefined}
              onSuccess={handlePaymentSuccess}
              onBack={handleBack}
            />
          )}
        </div>
      </aside>
    </>
  );
}