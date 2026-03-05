"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { Crown, Calendar, CreditCard, Loader2 } from "lucide-react";

// Componentes UI
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Tipos, Acciones y Datos
import { TipoPlanEmpresa, FrecuenciaPago } from "@prisma/client";
import { crearSuscripcion } from "@/01-actions/admin/suscriptions/suscriptions";
import { cancelarSuscripcion } from "@/01-actions/payment/cancelar-suscripcion";
import { plans } from "@/lib/plans/data";

// Tipado basado en tu modelo Prisma
interface SuscripcionInfo {
  id?: string;
  planTipo?: string | null;
  frecuenciaPago?: string | null;
  estadoSuscripcion: string;
  fechaInicio?: Date | string | null;
  fechaFinPeriodoActual?: Date | string | null;
  estadoPagoMercadoPago?: string | null;
}

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suscripcion: SuscripcionInfo | null | undefined;
}

// Helper para fechas (maneja string o Date)
const parseDate = (date: Date | string | null | undefined) =>
  date ? (date instanceof Date ? date : new Date(date)) : null;

export function SubscriptionModal({
  open,
  onOpenChange,
  suscripcion,
}: SubscriptionModalProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  // --- Lógica de PlanSelector con corrección de tipos ---
  const handleConfirmarPlan = async () => {
    if (!selectedPlanId) {
      toast.error("Por favor selecciona un plan.");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Separar el ID (ej: "basico_mensual")
      const [planBase, frecuencia] = selectedPlanId.split("_");

      // 2. Mapear correctamente a los Enums de Prisma
      // Si planBase es "basico" -> TipoPlanEmpresa.BASICO
      const planEnum =
        planBase === "basico" ? TipoPlanEmpresa.BASICO : TipoPlanEmpresa.PRO;

      // Si frecuencia es "mensual" -> FrecuenciaPago.MENSUAL
      const frecuenciaEnum =
        frecuencia === "mensual"
          ? FrecuenciaPago.MENSUAL
          : FrecuenciaPago.ANUAL;

      // 3. Enviar los Enums correctos a la acción
      const res = await crearSuscripcion(planEnum, frecuenciaEnum);

      // 4. Manejo de respuestas
      if (res?.redirectUrl) {
        // Redirige a Mercado Pago
        window.location.href = res.redirectUrl;
        return;
      }

      if (res?.updated) {
        toast.success(res.message || "Plan actualizado correctamente");
        onOpenChange(false);
        window.location.reload(); // Recargamos para ver cambios en el banner
        return;
      }

      // Manejo de errores explícitos desde el server action
      //@ts-ignore
      if (res?.error) {
        //@ts-ignore
        toast.error(res.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error inesperado al procesar la suscripción.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Lógica de Cancelación ---
  const handleCancelar = async () => {
    if (!confirm("¿Seguro que querés cancelar tu suscripción actual?")) return;

    setIsCanceling(true);
    try {
      const res = await cancelarSuscripcion();
      if (res?.ok) {
        toast.success("Suscripción cancelada correctamente");
        onOpenChange(false);
        window.location.reload();
      } else {
        toast.error("No se pudo cancelar la suscripción.");
      }
    } catch (error) {
      toast.error("Error al intentar cancelar.");
    } finally {
      setIsCanceling(false);
    }
  };

  const isActive = suscripcion?.estadoSuscripcion === "ACTIVA";
  const fechaFin = parseDate(suscripcion?.fechaFinPeriodoActual);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
              <Crown className="size-5 text-purple-600" />
            </div>
            <div>
              <DialogTitle>Gestión de Suscripción</DialogTitle>
              <DialogDescription>
                Elige tu plan o gestiona tu método de pago.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Sección: Estado Actual */}
        {suscripcion && (
          <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Estado actual
              </span>
              <Badge
                variant={isActive ? "default" : "secondary"}
                className={isActive ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {suscripcion.estadoSuscripcion}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <CreditCard className="w-3 h-3" /> Plan
                </span>
                <span className="font-medium capitalize">
                  {suscripcion.planTipo?.toLowerCase() || "Sin plan"}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Vencimiento
                </span>
                <span className="font-medium">
                  {fechaFin
                    ? format(fechaFin, "dd MMM yyyy", { locale: es })
                    : "—"}
                </span>
              </div>
            </div>

            {/* Botón para cancelar si está activa */}
            {isActive && (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 mt-2"
                onClick={handleCancelar}
                disabled={isCanceling}
              >
                {isCanceling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelando...
                  </>
                ) : (
                  "Cancelar Suscripción"
                )}
              </Button>
            )}
          </div>
        )}

        <Separator />

        {/* Sección: Selector de Plan */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Cambiar de Plan</h4>

          <RadioGroup
            value={selectedPlanId || ""}
            onValueChange={setSelectedPlanId}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {plans.map((plan) => {
              // Detectar si es el plan actual para deshabilitarlo visualmente
              //@ts-ignore
              const isCurrent =
                //@ts-ignore
                suscripcion?.planTipo === plan.base &&
                //@ts-ignore
                suscripcion?.frecuenciaPago === plan.frecuencia;

              return (
                <div key={plan.id} className="relative">
                  <RadioGroupItem
                    value={plan.id}
                    id={plan.id}
                    className="peer sr-only"
                    disabled={isCurrent} // No permitir seleccionar el mismo plan actual
                  />
                  <Label
                    htmlFor={plan.id}
                    className={`flex flex-col p-4 rounded-lg border cursor-pointer transition-all h-full
                      ${
                        isCurrent
                          ? "border-green-500 bg-green-50 dark:bg-green-950/30 opacity-75"
                          : "border-gray-200 hover:border-purple-400 peer-data-[state=checked]:border-purple-600 peer-data-[state=checked]:bg-purple-50 dark:peer-data-[state=checked]:bg-purple-950/30"
                      }`}
                  >
                    <div className="flex justify-between items-center w-full mb-2">
                      <span className="font-bold capitalize">{plan.name}</span>
                      {isCurrent && (
                        <Badge
                          variant="outline"
                          className="text-green-700 border-green-300"
                        >
                          Actual
                        </Badge>
                      )}
                    </div>
                    <div className="text-xl font-extrabold">
                      {plan.price}
                      <span className="text-xs font-normal ml-1">
                        {plan.period}
                      </span>
                    </div>
                    <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                      {plan.features.map((f, i) => (
                        <li key={i}>• {f}</li>
                      ))}
                    </ul>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>

        <DialogFooter className="pt-4 flex-col sm:flex-row gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cerrar
          </Button>
          <Button
            onClick={handleConfirmarPlan}
            disabled={!selectedPlanId || isLoading}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirigiendo...
              </>
            ) : (
              "Confirmar y Pagar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
