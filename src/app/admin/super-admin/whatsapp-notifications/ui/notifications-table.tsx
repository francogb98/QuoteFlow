import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  type NotificationProgressFilter,
  type NotificationProgressStatus,
  getPendingPaymentsForWhatsApp,
  type PaymentWindowFilter,
  type PendingPaymentVisualStatus,
} from "@/lib/data/super-admin-whatsapp";

function formatDate(value: Date | null) {
  if (!value) {
    return "Sin fecha";
  }
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
  }).format(value);
}

function formatDateTime(value: Date | null) {
  if (!value) {
    return "Nunca";
  }
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function PaymentStateBadge({ value }: { value: PendingPaymentVisualStatus }) {
  if (value === "VENCIDO") {
    return (
      <Badge className="border-red-200 bg-red-50 text-red-700">Vencido</Badge>
    );
  }
  if (value === "PROXIMO_A_VENCER") {
    return (
      <Badge className="border-amber-200 bg-amber-50 text-amber-700">
        Próximo a vencer
      </Badge>
    );
  }
  return (
    <Badge className="border-slate-200 bg-slate-100 text-slate-700">
      Pendiente
    </Badge>
  );
}

function NotificationStatusBadge({
  value,
}: {
  value: NotificationProgressStatus;
}) {
  if (value === "SENT") {
    return (
      <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
        Enviado
      </Badge>
    );
  }
  if (value === "OPENED") {
    return (
      <Badge className="border-blue-200 bg-blue-50 text-blue-700">
        Chat abierto
      </Badge>
    );
  }
  return (
    <Badge className="border-slate-200 bg-slate-100 text-slate-700">
      Pendiente
    </Badge>
  );
}

function rowStateBackground(status: NotificationProgressStatus) {
  if (status === "SENT") return "bg-emerald-50/70";
  if (status === "OPENED") return "bg-blue-50/70";
  return "";
}

function buildPageQuery(params: {
  search: string;
  status: PaymentWindowFilter;
  contactStatus: NotificationProgressFilter;
  page: number;
  pageSize: number;
}) {
  return new URLSearchParams({
    search: params.search,
    status: params.status,
    contactStatus: params.contactStatus,
    page: String(params.page),
    pageSize: String(params.pageSize),
  }).toString();
}

interface NotificationsTableParams {
  search?: string;
  status?: PaymentWindowFilter;
  contactStatus?: NotificationProgressFilter;
  page?: string;
  pageSize?: string;
}

export async function NotificationsTable({
  params,
}: {
  params: NotificationsTableParams;
}) {
  const search = params.search ?? "";
  const status = (params.status ?? "all") as PaymentWindowFilter;
  const contactStatus = (params.contactStatus ??
    "all") as NotificationProgressFilter;
  const page = Number(params.page ?? "1");
  const pageSize = Number(params.pageSize ?? "20");

  const result = await getPendingPaymentsForWhatsApp({
    search,
    status,
    contactStatus,
    page,
    pageSize,
  });

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-red-200 bg-red-50/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-red-900">
              Pendientes de contactar
            </CardTitle>
            <CardDescription className="text-red-800/80">
              Todavía no se abrió el chat de WhatsApp.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-red-900">
            {result.statusSummary.pendingContact}
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-amber-900">
              Chat abierto
            </CardTitle>
            <CardDescription className="text-amber-800/80">
              Se abrió WhatsApp pero falta confirmar envío.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-amber-900">
            {result.statusSummary.openedChat}
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-slate-50/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-slate-900">Enviados</CardTitle>
            <CardDescription className="text-slate-700">
              Mensajes confirmados como enviados.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-slate-900">
            {result.statusSummary.sent}
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Usuarios con pagos pendientes</CardTitle>
          <CardDescription>
            Página {result.page} de {result.totalPages}. Total:{" "}
            {result.total.toLocaleString("es-AR")}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Monto pendiente</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Días</TableHead>
                <TableHead>Progreso</TableHead>
                <TableHead>Último envío</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="py-8 text-center text-slate-500"
                  >
                    No hay usuarios para los filtros seleccionados.
                  </TableCell>
                </TableRow>
              ) : (
                result.rows.map((row) => (
                  <TableRow
                    key={`${row.usuarioId}:${row.pagoId}`}
                    className={rowStateBackground(row.notificationStatus)}
                  >
                    <TableCell className="align-top">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-slate-900">
                          {row.nombreCompleto}
                        </span>
                        <span className="text-xs text-slate-600">
                          {row.email ?? "Sin email"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="align-top">
                      {row.whatsappDisponible ? (
                        <span className="text-sm text-slate-700">
                          {row.telefonoNormalizado}
                        </span>
                      ) : (
                        <Badge className="border-slate-200 bg-slate-100 text-slate-600">
                          Sin WhatsApp válido
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="align-top text-sm font-medium text-slate-900">
                      {row.montoPendiente.toLocaleString("es-AR", {
                        style: "currency",
                        currency: "ARS",
                        maximumFractionDigits: 0,
                      })}
                    </TableCell>
                    <TableCell className="align-top text-sm text-slate-600">
                      {formatDate(row.fechaVencimiento)}
                    </TableCell>
                    <TableCell className="align-top">
                      <PaymentStateBadge value={row.estadoVisual} />
                    </TableCell>
                    <TableCell className="align-top text-sm text-slate-700">
                      {row.textoDias}
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="flex flex-col gap-2">
                        <NotificationStatusBadge
                          value={row.notificationStatus}
                        />
                        {row.sentAt && (
                          <span className="text-xs text-slate-500">
                            Enviado: {formatDateTime(row.sentAt)}
                          </span>
                        )}
                        {!row.sentAt && row.openedAt && (
                          <span className="text-xs text-slate-500">
                            Abierto: {formatDateTime(row.openedAt)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="align-top text-sm text-slate-600">
                      {formatDateTime(row.ultimoEnvioAt)}
                    </TableCell>
                    <TableCell className="text-right align-top">
                      <div className="flex justify-end gap-2">
                        {row.whatsappDisponible ? (
                          <Button
                            asChild
                            size="sm"
                            className="bg-emerald-600 text-white hover:bg-emerald-700"
                          >
                            <a
                              href={`/api/admin/whatsapp-notifications/open?usuarioId=${row.usuarioId}&pagoId=${row.pagoId}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              WhatsApp
                            </a>
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" disabled>
                            Sin número
                          </Button>
                        )}

                        <form
                          action="/api/admin/whatsapp-notifications/confirm"
                          method="post"
                        >
                          <input
                            type="hidden"
                            name="usuarioId"
                            value={row.usuarioId}
                          />
                          <input
                            type="hidden"
                            name="pagoId"
                            value={row.pagoId}
                          />
                          <input
                            type="hidden"
                            name="returnTo"
                            value={`/admin/super-admin/whatsapp-notifications?${buildPageQuery(
                              {
                                search,
                                status,
                                contactStatus,
                                page: result.page,
                                pageSize: result.pageSize,
                              },
                            )}`}
                          />
                          <Button
                            type="submit"
                            size="sm"
                            variant="outline"
                            disabled={row.notificationStatus !== "OPENED"}
                          >
                            Confirmar envío
                          </Button>
                        </form>

                        <form
                          action="/api/admin/whatsapp-notifications/reset"
                          method="post"
                        >
                          <input
                            type="hidden"
                            name="usuarioId"
                            value={row.usuarioId}
                          />
                          <input
                            type="hidden"
                            name="pagoId"
                            value={row.pagoId}
                          />
                          <input
                            type="hidden"
                            name="returnTo"
                            value={`/admin/super-admin/whatsapp-notifications?${buildPageQuery(
                              {
                                search,
                                status,
                                contactStatus,
                                page: result.page,
                                pageSize: result.pageSize,
                              },
                            )}`}
                          />
                          <Button
                            type="submit"
                            size="sm"
                            variant="ghost"
                            disabled={row.notificationStatus === "PENDING"}
                          >
                            Reset
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Ordenado por urgencia y vencimiento.
            </p>
            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                disabled={result.page <= 1}
              >
                <a
                  href={`/admin/super-admin/whatsapp-notifications?${buildPageQuery(
                    {
                      search,
                      status,
                      contactStatus,
                      page: Math.max(1, result.page - 1),
                      pageSize: result.pageSize,
                    },
                  )}`}
                >
                  Anterior
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                disabled={result.page >= result.totalPages}
              >
                <a
                  href={`/admin/super-admin/whatsapp-notifications?${buildPageQuery(
                    {
                      search,
                      status,
                      contactStatus,
                      page: Math.min(result.totalPages, result.page + 1),
                      pageSize: result.pageSize,
                    },
                  )}`}
                >
                  Siguiente
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
