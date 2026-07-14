import { Badge } from "@/components/ui/badge";
import type {
  CompanyActivityStatus,
  CompanyPaymentStatus,
  CompanySubscriptionStatus,
} from "@/lib/data/super-admin-dashboard";

function toneClasses(tone: "success" | "warning" | "danger" | "neutral") {
  if (tone === "success") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (tone === "warning") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (tone === "danger") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

export function SubscriptionStatusBadge({
  value,
}: {
  value: CompanySubscriptionStatus;
}) {
  const tone =
    value === "ACTIVA"
      ? "success"
      : value === "TRIAL" || value === "PENDIENTE"
        ? "warning"
        : value === "SIN_DATOS"
          ? "neutral"
          : "danger";

  return <Badge className={toneClasses(tone)}>{value}</Badge>;
}

export function PaymentStatusBadge({ value }: { value: CompanyPaymentStatus }) {
  return (
    <Badge className={toneClasses(value === "AL_DIA" ? "success" : "danger")}>
      {value === "AL_DIA" ? "Al día" : "Atrasado"}
    </Badge>
  );
}

export function ActivityStatusBadge({
  value,
}: {
  value: CompanyActivityStatus;
}) {
  const tone =
    value === "ACTIVA"
      ? "success"
      : value === "ATENCION"
        ? "warning"
        : "danger";

  return <Badge className={toneClasses(tone)}>{value}</Badge>;
}

export function AccountStatusBadge({
  value,
}: {
  value: "ACTIVA" | "SUSPENDIDA";
}) {
  return (
    <Badge className={toneClasses(value === "ACTIVA" ? "success" : "danger")}>
      {value}
    </Badge>
  );
}

export function HealthScoreBadge({ value }: { value: number }) {
  const tone = value >= 80 ? "success" : value >= 55 ? "warning" : "danger";
  return <Badge className={toneClasses(tone)}>{value}/100</Badge>;
}
