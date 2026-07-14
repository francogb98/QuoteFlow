import { Building2, CircleAlert, ShieldCheck, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SuperAdminOverview } from "@/lib/data/super-admin-dashboard";

const cards = [
  {
    key: "totalCompanies",
    label: "Empresas registradas",
    description: "Base total de clientes en la plataforma",
    icon: Building2,
    accent: "text-sky-600",
  },
  {
    key: "activeCompanies",
    label: "Empresas activas",
    description: "Cuentas operativas y habilitadas",
    icon: ShieldCheck,
    accent: "text-emerald-600",
  },
  {
    key: "overdueCompanies",
    label: "Pagos vencidos",
    description: "Empresas con riesgo o atraso actual",
    icon: CircleAlert,
    accent: "text-red-600",
  },
  {
    key: "totalUsers",
    label: "Usuarios en plataforma",
    description: "Usuarios registrados en todas las empresas",
    icon: Users,
    accent: "text-amber-600",
  },
] as const;

export function SuperAdminOverviewCards({
  overview,
}: {
  overview: SuperAdminOverview;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card key={card.key} className="border-slate-200/70 shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm font-medium text-slate-600">
                  {card.label}
                </CardTitle>
                <p className="mt-1 text-xs text-slate-500">
                  {card.description}
                </p>
              </div>
              <div className="rounded-full bg-slate-100 p-2">
                <Icon className={`h-4 w-4 ${card.accent}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-slate-900">
                {overview[card.key].toLocaleString("es-AR")}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
