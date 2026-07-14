import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  ActivityFilter,
  CompanyPaymentStatus,
  CompanySubscriptionStatus,
} from "@/lib/data/super-admin-dashboard";

interface Props {
  search: string;
  subscriptionStatus: CompanySubscriptionStatus | "all";
  paymentStatus: CompanyPaymentStatus | "all";
  activity: ActivityFilter;
}

export function CompanyFilters({
  search,
  subscriptionStatus,
  paymentStatus,
  activity,
}: Props) {
  return (
    <form className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
      <Input
        name="search"
        defaultValue={search}
        placeholder="Buscar por empresa o email de contacto"
      />

      <select
        name="subscriptionStatus"
        defaultValue={subscriptionStatus}
        className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
      >
        <option value="all">Todas las suscripciones</option>
        <option value="ACTIVA">Activa</option>
        <option value="VENCIDA">Vencida</option>
        <option value="TRIAL">Trial</option>
        <option value="PENDIENTE">Pendiente</option>
        <option value="CANCELADA">Cancelada</option>
      </select>

      <select
        name="paymentStatus"
        defaultValue={paymentStatus}
        className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
      >
        <option value="all">Todos los pagos</option>
        <option value="AL_DIA">Al día</option>
        <option value="ATRASADO">Atrasado</option>
      </select>

      <select
        name="activity"
        defaultValue={activity}
        className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
      >
        <option value="all">Toda actividad</option>
        <option value="recent">Actividad reciente</option>
        <option value="stale">Actividad desactualizada</option>
        <option value="none">Sin actividad</option>
      </select>

      <div className="flex gap-2">
        <Button
          type="submit"
          className="bg-slate-900 text-white hover:bg-slate-800"
        >
          Filtrar
        </Button>
        <Button asChild type="button" variant="outline">
          <Link href="/admin/super-admin">Limpiar</Link>
        </Button>
      </div>
    </form>
  );
}
