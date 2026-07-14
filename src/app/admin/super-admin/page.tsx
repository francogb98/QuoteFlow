import { Suspense } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getSuperAdminOverview,
  type ActivityFilter,
  type CompanyPaymentStatus,
  type CompanySubscriptionStatus,
} from "@/lib/data/super-admin-dashboard";
import { CompanyFilters } from "./ui/company-filters";
import { SuperAdminOverviewCards } from "./ui/overview-cards";
import { CompaniesTable } from "./ui/companies-table";
import { CompaniesTableSkeleton } from "./ui/companies-table-skeleton";

export default async function SuperAdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    page?: string;
    pageSize?: string;
    subscriptionStatus?: CompanySubscriptionStatus | "all";
    paymentStatus?: CompanyPaymentStatus | "all";
    activity?: ActivityFilter;
  }>;
}) {
  const params = await searchParams;
  const search = params.search ?? "";
  const subscriptionStatus = params.subscriptionStatus ?? "all";
  const paymentStatus = params.paymentStatus ?? "all";
  const activity = params.activity ?? "all";

  const overview = await getSuperAdminOverview();

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
          Panel de Super Admin
        </h1>
        <p className="max-w-3xl text-sm text-slate-600">
          Monitoreo centralizado del estado global de empresas, actividad
          operativa y riesgo de pagos.
        </p>
      </div>

      <SuperAdminOverviewCards overview={overview} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <CompanyFilters
          search={search}
          subscriptionStatus={subscriptionStatus}
          paymentStatus={paymentStatus}
          activity={activity}
        />

        <Card className="border-amber-200 bg-amber-50/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-amber-900">
              Atención operativa
            </CardTitle>
            <CardDescription className="text-amber-800/80">
              {overview.overdueCompanies} con pagos vencidos,{" "}
              {overview.expiringSoonCompanies} por vencer y{" "}
              {overview.trialCompanies} en trial.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Suspense
        key={JSON.stringify(params)}
        fallback={<CompaniesTableSkeleton />}
      >
        <CompaniesTable params={params} />
      </Suspense>
    </main>
  );
}
