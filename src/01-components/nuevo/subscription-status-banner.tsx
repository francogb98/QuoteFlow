"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ShieldCheck, Sparkles, AlertTriangle, RefreshCw } from "lucide-react";

import { cn } from "@/lib/utils";
import { EstadoSuscripcion } from "@prisma/client";
import { SubscriptionModal } from "./payment-action-modal";
// import { EstadoSuscripcion } from "@/lib/mock-data"; // Asumimos que importas el Enum de aquí
// import { SubscriptionModal } from "@/components/subscription-modal";

// Definimos la interfaz basada en lo que devuelve tu Prisma (con las fechas opcionales)
interface SuscripcionReal {
  estadoSuscripcion: EstadoSuscripcion | string;
  fechaFinPeriodoActual: Date | string | null;
  manualOverrideEstado?: EstadoSuscripcion | string | null;
  manualOverrideHasta?: Date | string | null;
  planTipo?: string | null; // Opcional porque podría no venir en la query original
  frecuenciaPago?: string | null;
}

interface SubscriptionStatusBannerProps {
  suscripcion: SuscripcionReal | null | undefined;
}

// Helper para convertir string/Date a Date de forma segura
function parseDate(date: Date | string | null | undefined): Date | null {
  if (!date) return null;
  return date instanceof Date ? date : new Date(date);
}

function getEffectiveStatus(
  suscripcion: SuscripcionReal,
): EstadoSuscripcion | string {
  const overrideDate = parseDate(suscripcion.manualOverrideHasta);

  if (
    suscripcion.manualOverrideEstado &&
    overrideDate &&
    overrideDate > new Date()
  ) {
    return suscripcion.manualOverrideEstado;
  }
  return suscripcion.estadoSuscripcion;
}

function isManualOverride(suscripcion: SuscripcionReal): boolean {
  const overrideDate = parseDate(suscripcion.manualOverrideHasta);
  return !!(
    suscripcion.manualOverrideEstado &&
    overrideDate &&
    overrideDate > new Date()
  );
}

export function SubscriptionStatusBanner({
  suscripcion,
}: SubscriptionStatusBannerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Si no hay suscripción, no mostramos nada o un estado por defecto
  if (!suscripcion) return null;

  const status = getEffectiveStatus(suscripcion);
  const hasOverride = isManualOverride(suscripcion);

  // Pasamos la suscripción real al config
  const config = getStatusConfig(status, suscripcion);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={cn(
          "flex w-full items-center gap-2 border-l-[3px] px-3 py-1.5 text-left text-xs transition-colors hover:opacity-90",
          config.containerClass,
        )}
      >
        {hasOverride ? (
          <ShieldCheck className="size-3.5 shrink-0" />
        ) : (
          <config.icon className="size-3.5 shrink-0" />
        )}
        <span className="flex-1 truncate">
          {hasOverride && <span className="mr-1 font-semibold">[Admin]</span>}
          {config.text}
        </span>
        <span className="shrink-0 font-semibold">{config.action}</span>
      </button>

      <SubscriptionModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        suscripcion={suscripcion} // Le pasas la misma prop que recibe el banner
      />
    </>
  );
}

function getStatusConfig(
  status: EstadoSuscripcion | string,
  suscripcion: SuscripcionReal,
) {
  // Usamos el parseDate para formatear
  const fechaFin = parseDate(suscripcion.fechaFinPeriodoActual);
  const fechaTexto = fechaFin
    ? format(fechaFin, "dd/MM", { locale: es })
    : "--/--";

  // Valores por defecto si faltan datos de plan (ya que son opcionales en tu query actual)
  const planNombre = suscripcion.planTipo || "Plan";
  const frecuencia = suscripcion.frecuenciaPago || "";

  switch (status) {
    case EstadoSuscripcion.TRIAL: // O el string "TRIAL" si usas strings sueltos
      return {
        containerClass:
          "bg-amber-50 text-amber-800 border-l-amber-400 dark:bg-amber-950/30 dark:text-amber-300 dark:border-l-amber-500",
        icon: Sparkles,
        text: `Periodo de Prueba — Vence el ${fechaTexto}`,
        action: "Activalo ahora!",
      };
    case EstadoSuscripcion.ACTIVA:
      return {
        containerClass:
          "bg-emerald-50 text-emerald-700 border-l-emerald-400 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-l-emerald-500",
        icon: ShieldCheck,
        text: `Plan Activo (${planNombre}) — ${frecuencia}`,
        action: "Gestionar",
      };
    case EstadoSuscripcion.VENCIDA:
    case EstadoSuscripcion.CANCELADA:
      return {
        containerClass:
          "bg-red-50 text-red-700 border-l-red-400 dark:bg-red-950/30 dark:text-red-300 dark:border-l-red-500",
        icon: AlertTriangle,
        text: `Suscripcion ${status === EstadoSuscripcion.VENCIDA ? "Vencida" : "Cancelada"}`,
        action: "Renovar Plan",
      };
    case EstadoSuscripcion.PENDIENTE:
      return {
        containerClass:
          "bg-amber-50 text-amber-800 border-l-amber-400 dark:bg-amber-950/30 dark:text-amber-300 dark:border-l-amber-500",
        icon: RefreshCw,
        text: "Suscripcion Pendiente de activacion",
        action: "Ver estado",
      };
    default:
      // Caso por defecto por si viene un estado desconocido
      return {
        containerClass: "bg-gray-50 text-gray-700 border-l-gray-400",
        icon: AlertTriangle,
        text: "Estado desconocido",
        action: "Info",
      };
  }
}
