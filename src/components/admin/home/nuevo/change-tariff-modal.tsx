"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ChangeTariffModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  currentTariffLabel: string;
  newTariffLabel: string;
  newTariffMonto: number | null;
  onConfirm: (applyToCurrent: boolean) => void;
  isPending?: boolean;
}

export function ChangeTariffModal({
  open,
  onOpenChange,
  userName,
  currentTariffLabel,
  newTariffLabel,
  newTariffMonto,
  onConfirm,
  isPending,
}: ChangeTariffModalProps) {
  const [applyToCurrent, setApplyToCurrent] = useState(false);

  const handleConfirm = () => {
    onConfirm(applyToCurrent);
    setApplyToCurrent(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
    setApplyToCurrent(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <AlertCircle className="h-5 w-5 text-primary" />
            Cambiar tarifa de usuario
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-foreground">
            Vas a cambiar la tarifa de{" "}
            <span className="font-semibold">{userName}</span> de{" "}
            <span className="font-semibold">{currentTariffLabel}</span> a{" "}
            <span className="font-semibold">{newTariffLabel}</span>.
          </p>

          <div className="rounded-lg border border-purple-100 bg-purple-50 p-3 text-xs text-purple-900">
            Por defecto, el nuevo monto se aplicará a partir de la cuota del
            próximo mes.
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={applyToCurrent}
              onChange={(e) => setApplyToCurrent(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-xs font-medium text-foreground">
              Actualizar también el monto del pago pendiente del mes actual
              {newTariffMonto != null &&
                ` a $${newTariffMonto.toLocaleString("es-AR")}`}
            </span>
          </label>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isPending}
            className="bg-gray-100 text-xs hover:bg-gray-200"
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-primary text-xs shadow-sm hover:bg-primary/90"
          >
            {isPending ? "Guardando..." : "Confirmar Cambio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}