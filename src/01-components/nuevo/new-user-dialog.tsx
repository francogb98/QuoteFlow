"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BulkUserForm } from "../admin/users/new/bulk-user-form";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface NewUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresaId: string;
  configuracionTarifa: any;
}

export function NewUserDialog({
  open,
  onOpenChange,
  empresaId,
  configuracionTarifa,
}: NewUserDialogProps) {
  const router = useRouter();

  function handleSuccess() {
    onOpenChange(false);
  }

  const hasTarifa = !!configuracionTarifa;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {hasTarifa ? "Carga masiva de usuarios" : "Configuración requerida"}
          </DialogTitle>

          <DialogDescription>
            {hasTarifa
              ? "Agregue múltiples usuarios y asígneles su tarifa correspondiente."
              : "Aún no configuraste tus tarifas. Debes crear al menos una tarifa antes de poder registrar usuarios."}
          </DialogDescription>
        </DialogHeader>

        {hasTarifa ? (
          <BulkUserForm
            empresaId={empresaId}
            configuracionTarifa={configuracionTarifa}
            onSuccess={handleSuccess}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-10">
            <Button
              onClick={() => {
                onOpenChange(false);
                router.push("/admin/tarifas");
              }}
            >
              Configurar tarifas
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
