import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TipoConfiguracionTarifa } from "@prisma/client";
import { Settings2 } from "lucide-react";

interface TypeSwitchDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (newType: TipoConfiguracionTarifa) => void;
  currentType: TipoConfiguracionTarifa;
}

export function TypeSwitchDialog({
  open,
  onClose,
  onConfirm,
  currentType,
}: TypeSwitchDialogProps) {
  const newType =
    currentType === "FIJA_MENSUAL"
      ? "DINAMICA_POR_FECHA_INGRESO"
      : "FIJA_MENSUAL";

  const newTypeLabel =
    newType === "FIJA_MENSUAL" ? "Fija Mensual" : "Dinámica por Ingreso";

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Settings2 className="w-5 h-5 text-blue-600" />
            </div>
            <AlertDialogTitle>Cambiar Tipo de Configuración</AlertDialogTitle>
          </div>
        </AlertDialogHeader>
        <AlertDialogDescription>
          Estás a punto de cambiar tu configuración de tarifas de{" "}
          <b>
            {currentType === "FIJA_MENSUAL"
              ? "Fija Mensual"
              : "Dinámica por Ingreso"}
          </b>{" "}
          a <b>{newTypeLabel}</b>.
          <br />
          <br />
          ⚠️ <b>Atención:</b> Esta acción eliminará todas las tarifas existentes
          y los usuarios con tarifas asignadas perderán su configuración.
          Deberás volver a configurarlas.
          <br />
          <br />
          <b>¿Estás seguro de que deseas continuar?</b>
        </AlertDialogDescription>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={() => onConfirm(newType)}>
            Confirmar Cambio
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
