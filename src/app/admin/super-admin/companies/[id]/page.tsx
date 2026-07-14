import Link from "next/link";
import { notFound } from "next/navigation";
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
import { getSuperAdminCompanyDetail } from "@/lib/data/super-admin-dashboard";
import {
  AccountStatusBadge,
  ActivityStatusBadge,
  HealthScoreBadge,
  PaymentStatusBadge,
  SubscriptionStatusBadge,
} from "../../ui/super-admin-badges";

function formatDateTime(value: Date | null) {
  if (!value) {
    return "Sin dato";
  }

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function SuperAdminCompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getSuperAdminCompanyDetail(id);

  if (!detail) {
    notFound();
  }

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <SubscriptionStatusBadge
              value={detail.company.subscriptionStatus}
            />
            <PaymentStatusBadge value={detail.company.paymentStatus} />
            <AccountStatusBadge value={detail.company.accountStatus} />
            <ActivityStatusBadge value={detail.company.activityStatus} />
          </div>
          <h1 className="text-3xl font-semibold text-slate-950">
            {detail.company.nombre}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {detail.company.contactEmail ??
              detail.company.primaryAdminEmail ??
              "Sin email de contacto"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <HealthScoreBadge value={detail.company.healthScore} />
          <Button asChild variant="outline">
            <Link href="/admin/super-admin">Volver al dashboard</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="border-slate-200 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle>Resumen de cuenta</CardTitle>
            <CardDescription>
              Estado global para monitoreo rápido.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Plan
              </p>
              <p className="text-sm font-medium text-slate-900">
                {detail.company.planTipo}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Frecuencia
              </p>
              <p className="text-sm font-medium text-slate-900">
                {detail.company.frecuenciaPago ?? "Sin dato"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Inicio suscripción
              </p>
              <p className="text-sm font-medium text-slate-900">
                {formatDateTime(detail.company.fechaInicioSuscripcion)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Fin período actual
              </p>
              <p className="text-sm font-medium text-slate-900">
                {formatDateTime(detail.company.fechaFinPeriodoActual)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Última actividad
              </p>
              <p className="text-sm font-medium text-slate-900">
                {formatDateTime(detail.company.lastActivity)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Próximo vencimiento
              </p>
              <p className="text-sm font-medium text-slate-900">
                {formatDateTime(detail.company.fechaProximoVencimiento)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Usuarios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            <div className="flex items-center justify-between">
              <span>Total</span>
              <strong>{detail.company.totalUsers}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Activos</span>
              <strong>{detail.company.usuariosActivos}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Admins activos</span>
              <strong>{detail.company.activeAdmins}</strong>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Operación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            <div className="flex items-center justify-between">
              <span>Operaciones</span>
              <strong>{detail.company.totalOperations}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Ingresos cobrados</span>
              <strong>
                {detail.company.totalSubscriptionRevenue.toLocaleString(
                  "es-AR",
                  {
                    style: "currency",
                    currency: "ARS",
                    maximumFractionDigits: 0,
                  },
                )}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Logs básicos</span>
              <strong>{detail.logs.length}</strong>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Historial de pagos</CardTitle>
            <CardDescription>
              Últimos cobros de suscripción registrados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>ID Mercado Pago</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detail.paymentHistory.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-6 text-center text-slate-500"
                    >
                      Sin historial de pagos de suscripción.
                    </TableCell>
                  </TableRow>
                ) : (
                  detail.paymentHistory.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{formatDateTime(payment.fechaPago)}</TableCell>
                      <TableCell>
                        {payment.monto.toLocaleString("es-AR", {
                          style: "currency",
                          currency: "ARS",
                          maximumFractionDigits: 0,
                        })}
                      </TableCell>
                      <TableCell>{payment.estadoMercadoPago}</TableCell>
                      <TableCell className="max-w-[160px] truncate text-xs text-slate-500">
                        {payment.mercadoPagoPaymentId}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Logs básicos</CardTitle>
            <CardDescription>
              Eventos recientes asociados a la empresa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Entidad</TableHead>
                  <TableHead>Responsable</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detail.logs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-6 text-center text-slate-500"
                    >
                      No hay logs disponibles.
                    </TableCell>
                  </TableRow>
                ) : (
                  detail.logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{formatDateTime(log.createdAt)}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.entityType}</TableCell>
                      <TableCell>{log.adminNombre ?? "Sistema"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Administradores asociados</CardTitle>
            <CardDescription>
              Responsables operativos vinculados a la cuenta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detail.admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>{admin.nombre}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{admin.rol}</TableCell>
                    <TableCell>
                      {admin.estaActivo ? "Activo" : "Inactivo"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Usuarios asociados</CardTitle>
            <CardDescription>
              Se muestran los 20 usuarios más recientes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Admin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detail.users.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-6 text-center text-slate-500"
                    >
                      No hay usuarios asociados.
                    </TableCell>
                  </TableRow>
                ) : (
                  detail.users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        {user.nombre} {user.apellido}
                      </TableCell>
                      <TableCell>{user.email ?? "Sin email"}</TableCell>
                      <TableCell>
                        {user.estaActivo ? user.estado : "INACTIVO"}
                      </TableCell>
                      <TableCell>{user.adminNombre}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
