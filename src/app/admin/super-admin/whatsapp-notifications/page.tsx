import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  type NotificationProgressFilter,
  getDefaultWhatsAppTemplate,
  getWhatsAppTemplate,
  type PaymentWindowFilter,
} from "@/lib/data/super-admin-whatsapp";
import { NotificationsTable } from "./ui/notifications-table";
import { NotificationsTableSkeleton } from "./ui/notifications-table-skeleton";
import { TestWhatsAppCard } from "./ui/test-whatsapp-card";

export default async function SuperAdminWhatsappNotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: PaymentWindowFilter;
    contactStatus?: NotificationProgressFilter;
    page?: string;
    pageSize?: string;
    templateSaved?: string;
    templateError?: string;
    actionSuccess?: string;
    actionError?: string;
  }>;
}) {
  const params = await searchParams;
  const search = params.search ?? "";
  const status = (params.status ?? "all") as PaymentWindowFilter;
  const contactStatus = (params.contactStatus ??
    "all") as NotificationProgressFilter;

  const template = await getWhatsAppTemplate();

  const sampleMessage = template
    .replaceAll("{nombre}", "Juan Pérez")
    .replaceAll("{monto}", "25000")
    .replaceAll("{fecha_vencimiento}", "5 may 2026")
    .replaceAll("{dias}", "3");

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
          Notificaciones WhatsApp
        </h1>
        <p className="max-w-3xl text-sm text-slate-600">
          Gestión manual de recordatorios de pago para usuarios pendientes y
          vencidos.
        </p>
      </div>

      <TestWhatsAppCard />

      {params.templateSaved === "1" && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="py-4 text-sm text-emerald-700">
            Template actualizado correctamente.
          </CardContent>
        </Card>
      )}

      {!!params.templateError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4 text-sm text-red-700">
            {params.templateError}
          </CardContent>
        </Card>
      )}

      {!!params.actionSuccess && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="py-4 text-sm text-emerald-700">
            {params.actionSuccess === "sent"
              ? "Estado actualizado a Enviado."
              : "Estado reseteado a Pendiente."}
          </CardContent>
        </Card>
      )}

      {!!params.actionError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4 text-sm text-red-700">
            {params.actionError}
          </CardContent>
        </Card>
      )}

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Busca por nombre o email y prioriza casos urgentes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 rounded-xl border border-slate-200 p-3 lg:grid-cols-[2fr_1fr_1fr_auto]">
            <Input
              name="search"
              defaultValue={search}
              placeholder="Buscar por nombre o email"
            />
            <select
              name="status"
              defaultValue={status}
              className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
            >
              <option value="all">Todos</option>
              <option value="overdue">Vencidos</option>
              <option value="due_soon">Próximos a vencer (7 días)</option>
              <option value="pending">Pendientes</option>
            </select>
            <select
              name="contactStatus"
              defaultValue={contactStatus}
              className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
            >
              <option value="all">Todos los estados de contacto</option>
              <option value="pending_contact">Pendientes de contactar</option>
              <option value="opened_chat">Chat abierto</option>
              <option value="sent">Ya enviados</option>
            </select>
            <div className="flex gap-2">
              <Button
                type="submit"
                className="bg-slate-900 text-white hover:bg-slate-800"
              >
                Aplicar
              </Button>
              <Button asChild type="button" variant="outline">
                <a href="/admin/super-admin/whatsapp-notifications">Limpiar</a>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Suspense
        key={JSON.stringify({
          search: params.search,
          status: params.status,
          contactStatus: params.contactStatus,
          page: params.page,
          pageSize: params.pageSize,
        })}
        fallback={<NotificationsTableSkeleton />}
      >
        <NotificationsTable params={params} />
      </Suspense>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Template de mensaje</CardTitle>
          <CardDescription>
            Variables disponibles: {"{nombre}"}, {"{monto}"},{" "}
            {"{fecha_vencimiento}"}, {"{dias}"}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            action="/api/admin/whatsapp-notifications/template"
            method="post"
            className="space-y-3"
          >
            <textarea
              name="template"
              defaultValue={template || getDefaultWhatsAppTemplate()}
              className="min-h-[140px] w-full rounded-md border border-slate-200 p-3 text-sm text-slate-800 outline-none focus:border-slate-400"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-slate-900 text-white hover:bg-slate-800"
              >
                Guardar template
              </Button>
            </div>
          </form>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              Vista previa
            </p>
            <p className="text-sm text-slate-700">{sampleMessage}</p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
