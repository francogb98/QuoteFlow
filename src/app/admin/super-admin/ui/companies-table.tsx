import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  getSuperAdminCompanies,
  type ActivityFilter,
  type CompanyPaymentStatus,
  type CompanySubscriptionStatus,
} from "@/lib/data/super-admin-dashboard";
import {
  AccountStatusBadge,
  ActivityStatusBadge,
  HealthScoreBadge,
  PaymentStatusBadge,
  SubscriptionStatusBadge,
} from "./super-admin-badges";

function formatDate(value: Date | null) {
  if (!value) {
    return "Sin dato";
  }
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
  }).format(value);
}

interface CompaniesTableParams {
  search?: string;
  page?: string;
  pageSize?: string;
  subscriptionStatus?: CompanySubscriptionStatus | "all";
  paymentStatus?: CompanyPaymentStatus | "all";
  activity?: ActivityFilter;
}

export async function CompaniesTable({
  params,
}: {
  params: CompaniesTableParams;
}) {
  const search = params.search ?? "";
  const page = Number(params.page ?? "1");
  const pageSize = Number(params.pageSize ?? "10");
  const subscriptionStatus = params.subscriptionStatus ?? "all";
  const paymentStatus = params.paymentStatus ?? "all";
  const activity = params.activity ?? "all";

  const companiesResult = await getSuperAdminCompanies({
    page,
    pageSize,
    search,
    subscriptionStatus,
    paymentStatus,
    activity,
  });

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <CardTitle>Empresas</CardTitle>
          <CardDescription>
            Página {companiesResult.page} de {companiesResult.totalPages}.
            Total: {companiesResult.total.toLocaleString("es-AR")} empresas.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>Suscripción</TableHead>
              <TableHead>Pago</TableHead>
              <TableHead>Usuarios activos</TableHead>
              <TableHead>Última actividad</TableHead>
              <TableHead>Cuenta</TableHead>
              <TableHead>Health Score</TableHead>
              <TableHead className="text-right">Detalle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companiesResult.companies.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-8 text-center text-slate-500"
                >
                  No hay empresas que coincidan con los filtros actuales.
                </TableCell>
              </TableRow>
            ) : (
              companiesResult.companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="align-top">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-slate-900">
                        {company.nombre}
                      </span>
                      <span className="text-xs text-slate-500">
                        {company.id}
                      </span>
                      <span className="text-xs text-slate-600">
                        {company.contactEmail ?? "Sin email de contacto"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="flex flex-col gap-2">
                      <SubscriptionStatusBadge
                        value={company.subscriptionStatus}
                      />
                      <span className="text-xs text-slate-500">
                        Inicio: {formatDate(company.fechaInicioSuscripcion)}
                      </span>
                      <span className="text-xs text-slate-500">
                        Fin período: {formatDate(company.fechaFinPeriodoActual)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="flex flex-col gap-2">
                      <PaymentStatusBadge value={company.paymentStatus} />
                      <span className="text-xs text-slate-500">
                        Último pago: {formatDate(company.fechaUltimoPago)}
                      </span>
                      <span className="text-xs text-slate-500">
                        Próximo vencimiento:{" "}
                        {formatDate(company.fechaProximoVencimiento)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="flex flex-col gap-2">
                      <span className="font-medium text-slate-900">
                        {company.usuariosActivos.toLocaleString("es-AR")}
                      </span>
                      <ActivityStatusBadge value={company.activityStatus} />
                    </div>
                  </TableCell>
                  <TableCell className="align-top text-sm text-slate-600">
                    {formatDate(company.lastActivity)}
                  </TableCell>
                  <TableCell className="align-top">
                    <AccountStatusBadge value={company.accountStatus} />
                  </TableCell>
                  <TableCell className="align-top">
                    <HealthScoreBadge value={company.healthScore} />
                  </TableCell>
                  <TableCell className="text-right align-top">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/super-admin/companies/${company.id}`}>
                        Ver detalle
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Mostrando hasta {companiesResult.pageSize} resultados por página.
          </p>
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              disabled={companiesResult.page <= 1}
            >
              <Link
                href={`/admin/super-admin?${new URLSearchParams({
                  search,
                  subscriptionStatus,
                  paymentStatus,
                  activity,
                  page: String(Math.max(1, companiesResult.page - 1)),
                  pageSize: String(companiesResult.pageSize),
                }).toString()}`}
              >
                Anterior
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              disabled={companiesResult.page >= companiesResult.totalPages}
            >
              <Link
                href={`/admin/super-admin?${new URLSearchParams({
                  search,
                  subscriptionStatus,
                  paymentStatus,
                  activity,
                  page: String(
                    Math.min(
                      companiesResult.totalPages,
                      companiesResult.page + 1,
                    ),
                  ),
                  pageSize: String(companiesResult.pageSize),
                }).toString()}`}
              >
                Siguiente
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
