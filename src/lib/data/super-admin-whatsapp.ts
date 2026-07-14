import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const DEFAULT_TEMPLATE =
  "Hola {nombre}, te recordamos que tienes un pago pendiente de ${monto} con vencimiento el {fecha_vencimiento}. Por favor, regulariza tu situación. ¡Gracias!";

function getConfiguracionWhatsAppDelegate() {
  return (prisma as any).configuracionWhatsApp;
}

function getLogNotificacionWhatsAppManualDelegate() {
  return (prisma as any).logNotificacionWhatsAppManual;
}

export type PaymentWindowFilter = "all" | "overdue" | "due_soon" | "pending";
export type PendingPaymentVisualStatus =
  | "VENCIDO"
  | "PROXIMO_A_VENCER"
  | "PENDIENTE";
export type NotificationProgressFilter =
  | "all"
  | "pending_contact"
  | "opened_chat"
  | "sent";
export type NotificationProgressStatus = "PENDING" | "OPENED" | "SENT";

export interface SuperAdminWhatsAppFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: PaymentWindowFilter;
  contactStatus?: NotificationProgressFilter;
}

export interface PendingWhatsAppRow {
  usuarioId: string;
  pagoId: string;
  nombreCompleto: string;
  email: string | null;
  telefonoOriginal: string | null;
  telefonoNormalizado: string | null;
  whatsappDisponible: boolean;
  montoPendiente: number;
  fechaVencimiento: Date | null;
  estadoVisual: PendingPaymentVisualStatus;
  textoDias: string;
  diasDelta: number | null;
  waUrl: string | null;
  notificationStatus: NotificationProgressStatus;
  openedAt: Date | null;
  sentAt: Date | null;
  ultimoEnvioAt: Date | null;
}

export interface PendingWhatsAppResult {
  rows: PendingWhatsAppRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  summary: {
    overdue: number;
    dueSoon: number;
    pending: number;
  };
  statusSummary: {
    pendingContact: number;
    openedChat: number;
    sent: number;
  };
}

export function getDefaultWhatsAppTemplate() {
  return DEFAULT_TEMPLATE;
}

export async function getWhatsAppTemplate() {
  const configuracionWhatsApp = getConfiguracionWhatsAppDelegate();

  if (!configuracionWhatsApp) {
    return DEFAULT_TEMPLATE;
  }

  const config = await configuracionWhatsApp.findUnique({
    where: { id: "global" },
    select: { mensajeTemplate: true },
  });

  return config?.mensajeTemplate || DEFAULT_TEMPLATE;
}

export function normalizeWhatsappPhone(phone: string | null | undefined) {
  if (!phone) {
    return null;
  }

  const digits = phone.replace(/\D+/g, "");
  if (!digits) {
    return null;
  }

  const normalized = digits.startsWith("00") ? digits.slice(2) : digits;
  return normalized.length >= 10 ? normalized : null;
}

function clampPage(page?: number) {
  if (!page || Number.isNaN(page)) {
    return 1;
  }

  return Math.max(page, 1);
}

function clampPageSize(pageSize?: number) {
  if (!pageSize || Number.isNaN(pageSize)) {
    return DEFAULT_PAGE_SIZE;
  }

  return Math.min(Math.max(pageSize, 1), MAX_PAGE_SIZE);
}

export function getPaymentVisualState(
  estado: string,
  fechaVencimiento: Date | null,
): PendingPaymentVisualStatus {
  if (estado === "VENCIDO") {
    return "VENCIDO";
  }

  if (!fechaVencimiento) {
    return "PENDIENTE";
  }

  const now = new Date();
  if (fechaVencimiento.getTime() < now.getTime()) {
    return "VENCIDO";
  }

  const days = getDayDelta(fechaVencimiento, now);
  if (days !== null && days <= 7) {
    return "PROXIMO_A_VENCER";
  }

  return "PENDIENTE";
}

function getDayDelta(target: Date | null, baseDate: Date = new Date()) {
  if (!target) {
    return null;
  }

  const end = Date.UTC(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
  );
  const base = Date.UTC(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
  );
  return Math.ceil((end - base) / (1000 * 60 * 60 * 24));
}

function formatDate(value: Date | null) {
  if (!value) {
    return "sin fecha";
  }

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
  }).format(value);
}

function getDaysText(
  estadoVisual: PendingPaymentVisualStatus,
  days: number | null,
) {
  if (days === null) {
    return "Sin fecha de vencimiento";
  }

  if (estadoVisual === "VENCIDO") {
    const overdueDays = Math.abs(days);
    if (overdueDays === 0) {
      return "Vence hoy";
    }
    return `Vencido hace ${overdueDays} día${overdueDays === 1 ? "" : "s"}`;
  }

  if (days === 0) {
    return "Vence hoy";
  }

  return `Vence en ${days} día${days === 1 ? "" : "s"}`;
}

export function renderWhatsAppMessage(
  template: string,
  vars: {
    nombre: string;
    monto: number;
    fechaVencimiento: Date | null;
    dias: number | null;
  },
) {
  const monto = vars.monto.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  const fecha = formatDate(vars.fechaVencimiento);
  const diasText = vars.dias === null ? "sin fecha" : String(vars.dias);

  return template
    .replaceAll("{nombre}", vars.nombre)
    .replaceAll("{monto}", monto)
    .replaceAll("{fecha_vencimiento}", fecha)
    .replaceAll("{dias}", diasText);
}

function buildPaymentWhere(status: PaymentWindowFilter): Prisma.PagoWhereInput {
  const now = new Date();
  const dueSoonDate = new Date(now);
  dueSoonDate.setDate(dueSoonDate.getDate() + 7);

  if (status === "overdue") {
    return {
      OR: [
        { estado: "VENCIDO" },
        {
          AND: [{ estado: "PENDIENTE" }, { fechaVencimiento: { lt: now } }],
        },
      ],
    };
  }

  if (status === "due_soon") {
    return {
      estado: "PENDIENTE",
      fechaVencimiento: {
        gte: now,
        lte: dueSoonDate,
      },
    };
  }

  if (status === "pending") {
    return {
      estado: "PENDIENTE",
      OR: [
        { fechaVencimiento: null },
        { fechaVencimiento: { gt: dueSoonDate } },
      ],
    };
  }

  return {
    OR: [{ estado: "PENDIENTE" }, { estado: "VENCIDO" }],
  };
}

function matchesContactStatusFilter(
  status: NotificationProgressStatus,
  filter: NotificationProgressFilter,
) {
  if (filter === "all") {
    return true;
  }

  if (filter === "pending_contact") {
    return status === "PENDING";
  }

  if (filter === "opened_chat") {
    return status === "OPENED";
  }

  return status === "SENT";
}

function resolveNotificationStatus(log: {
  status: NotificationProgressStatus;
  openedAt: Date | null;
  sentAt: Date | null;
} | null): {
  status: NotificationProgressStatus;
  openedAt: Date | null;
  sentAt: Date | null;
} {
  if (!log) {
    return {
      status: "PENDING",
      openedAt: null,
      sentAt: null,
    };
  }

  return {
    status: log.status,
    openedAt: log.openedAt,
    sentAt: log.sentAt,
  };
}

export async function getPendingPaymentsForWhatsApp(
  filters: SuperAdminWhatsAppFilters,
): Promise<PendingWhatsAppResult> {
  const page = clampPage(filters.page);
  const pageSize = clampPageSize(filters.pageSize);
  const search = filters.search?.trim();
  const status = filters.status ?? "all";
  const contactStatus = filters.contactStatus ?? "all";
  const paymentWhere = buildPaymentWhere(status);

  const userWhere: Prisma.UsuarioWhereInput = {
    pagos: {
      some: paymentWhere,
    },
  };

  if (search) {
    userWhere.OR = [
      { nombre: { contains: search, mode: "insensitive" } },
      { apellido: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, summaryRaw] = await Promise.all([
    prisma.usuario.findMany({
      where: userWhere,
      orderBy: [{ fechaCreacion: "desc" }],
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        pagos: {
          where: paymentWhere,
          orderBy: [
            { fechaVencimiento: "asc" },
            { estado: "desc" },
            { fecha: "desc" },
          ],
          take: 1,
          select: {
            id: true,
            monto: true,
            estado: true,
            fechaVencimiento: true,
          },
        },
      },
    }),
    prisma.pago.groupBy({
      by: ["estado"],
      where: {
        OR: [{ estado: "PENDIENTE" }, { estado: "VENCIDO" }],
      },
      _count: { _all: true },
    }),
  ]);

  const rowsBase = users
    .map((user) => {
      const payment = user.pagos[0];
      if (!payment) {
        return null;
      }

      const telefonoNormalizado = normalizeWhatsappPhone(user.telefono);
      const estadoVisual = getPaymentVisualState(
        payment.estado,
        payment.fechaVencimiento,
      );
      const diasDelta = getDayDelta(payment.fechaVencimiento);
      const nombreCompleto = `${user.nombre} ${user.apellido}`.trim();

      return {
        usuarioId: user.id,
        pagoId: payment.id,
        nombreCompleto,
        email: user.email,
        telefonoOriginal: user.telefono,
        telefonoNormalizado,
        whatsappDisponible: !!telefonoNormalizado,
        montoPendiente: payment.monto,
        fechaVencimiento: payment.fechaVencimiento,
        estadoVisual,
        textoDias: getDaysText(estadoVisual, diasDelta),
        diasDelta,
      };
    })
    .filter((row): row is NonNullable<typeof row> => !!row)
    .sort((a, b) => {
      const severity = (statusValue: PendingPaymentVisualStatus) => {
        if (statusValue === "VENCIDO") {
          return 3;
        }
        if (statusValue === "PROXIMO_A_VENCER") {
          return 2;
        }
        return 1;
      };

      const severityDiff = severity(b.estadoVisual) - severity(a.estadoVisual);
      if (severityDiff !== 0) {
        return severityDiff;
      }

      const aTime = a.fechaVencimiento?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const bTime = b.fechaVencimiento?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    });

  const pairFilters = rowsBase.map((row) => ({
    usuarioId: row.usuarioId,
    pagoId: row.pagoId,
  }));

  const logNotificacionWhatsAppManual =
    getLogNotificacionWhatsAppManualDelegate();

  const lastLogs =
    pairFilters.length && logNotificacionWhatsAppManual
      ? await logNotificacionWhatsAppManual.findMany({
          where: {
            OR: pairFilters,
          },
          orderBy: { sentAt: "desc" },
          distinct: ["usuarioId", "pagoId"],
          select: {
            usuarioId: true,
            pagoId: true,
            status: true,
            openedAt: true,
            sentAt: true,
            updatedAt: true,
          },
        })
      : [];

  const lastLogMap = new Map<
    string,
    {
      status: NotificationProgressStatus;
      openedAt: Date | null;
      sentAt: Date | null;
      updatedAt: Date;
    }
  >();
  for (const log of lastLogs) {
    lastLogMap.set(`${log.usuarioId}:${log.pagoId}`, {
      status: log.status,
      openedAt: log.openedAt,
      sentAt: log.sentAt,
      updatedAt: log.updatedAt,
    });
  }

  const template = await getWhatsAppTemplate();

  const allRows = rowsBase.map((row) => {
    const previewMessage = renderWhatsAppMessage(template, {
      nombre: row.nombreCompleto,
      monto: row.montoPendiente,
      fechaVencimiento: row.fechaVencimiento,
      dias: row.diasDelta,
    });
    const waUrl = row.telefonoNormalizado
      ? `https://wa.me/${row.telefonoNormalizado}?text=${encodeURIComponent(previewMessage)}`
      : null;
    const progress = resolveNotificationStatus(
      lastLogMap.get(`${row.usuarioId}:${row.pagoId}`) ?? null,
    );

    return {
      ...row,
      waUrl,
      notificationStatus: progress.status,
      openedAt: progress.openedAt,
      sentAt: progress.sentAt,
      ultimoEnvioAt: progress.sentAt,
    } satisfies PendingWhatsAppRow;
  });

  const statusSummary = {
    pendingContact: allRows.filter((row) => row.notificationStatus === "PENDING")
      .length,
    openedChat: allRows.filter((row) => row.notificationStatus === "OPENED").length,
    sent: allRows.filter((row) => row.notificationStatus === "SENT").length,
  };

  const rows = allRows.filter((row) =>
    matchesContactStatusFilter(row.notificationStatus, contactStatus),
  );

  const summary = {
    overdue: 0,
    dueSoon: 0,
    pending: 0,
  };

  for (const row of rows) {
    if (row.estadoVisual === "VENCIDO") {
      summary.overdue += 1;
    } else if (row.estadoVisual === "PROXIMO_A_VENCER") {
      summary.dueSoon += 1;
    } else {
      summary.pending += 1;
    }
  }

  const overdueFromDb = summaryRaw.find((row) => row.estado === "VENCIDO")
    ?._count._all;

  const filteredTotal = rows.length;
  const paginatedRows = rows.slice((page - 1) * pageSize, page * pageSize);

  return {
    rows: paginatedRows,
    total: filteredTotal,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(filteredTotal / pageSize)),
    summary: {
      overdue: overdueFromDb ?? summary.overdue,
      dueSoon: summary.dueSoon,
      pending: summary.pending,
    },
    statusSummary,
  };
}

export async function saveWhatsAppTemplate(
  template: string,
  adminId: string,
): Promise<void> {
  const cleanTemplate = template.trim();
  if (!cleanTemplate) {
    throw new Error("El template no puede estar vacío");
  }

  if (cleanTemplate.length > 2000) {
    throw new Error("El template no puede superar los 2000 caracteres");
  }

  const configuracionWhatsApp = getConfiguracionWhatsAppDelegate();

  if (!configuracionWhatsApp) {
    throw new Error(
      "ConfiguracionWhatsApp no está disponible en Prisma Client. Reinicia el servidor y ejecuta prisma generate.",
    );
  }

  await configuracionWhatsApp.upsert({
    where: { id: "global" },
    create: {
      id: "global",
      mensajeTemplate: cleanTemplate,
      updatedById: adminId,
    },
    update: {
      mensajeTemplate: cleanTemplate,
      updatedById: adminId,
    },
  });
}

export async function buildWhatsAppSendPayload(params: {
  usuarioId: string;
  pagoId: string;
}) {
  const template = await getWhatsAppTemplate();

  const payment = await prisma.pago.findFirst({
    where: {
      id: params.pagoId,
      usuarioId: params.usuarioId,
      OR: [{ estado: "PENDIENTE" }, { estado: "VENCIDO" }],
    },
    select: {
      id: true,
      monto: true,
      estado: true,
      fechaVencimiento: true,
      usuario: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          telefono: true,
          email: true,
        },
      },
    },
  });

  if (!payment) {
    return null;
  }

  const telefonoNormalizado = normalizeWhatsappPhone(payment.usuario.telefono);
  if (!telefonoNormalizado) {
    return {
      kind: "invalid_phone" as const,
      message: "El usuario no tiene un número válido para WhatsApp",
    };
  }

  const nombreCompleto =
    `${payment.usuario.nombre} ${payment.usuario.apellido}`.trim();
  const diasDelta = getDayDelta(payment.fechaVencimiento);
  const mensaje = renderWhatsAppMessage(template, {
    nombre: nombreCompleto,
    monto: payment.monto,
    fechaVencimiento: payment.fechaVencimiento,
    dias: diasDelta,
  });

  const waUrl = `https://wa.me/${telefonoNormalizado}?text=${encodeURIComponent(mensaje)}`;

  return {
    kind: "ok" as const,
    payload: {
      usuarioId: payment.usuario.id,
      pagoId: payment.id,
      telefonoNormalizado,
      mensaje,
      waUrl,
    },
  };
}

export async function registerManualWhatsAppClick(params: {
  usuarioId: string;
  pagoId: string;
  telefonoNormalizado: string;
  mensaje: string;
  waUrl: string;
  adminId: string;
}) {
  const logNotificacionWhatsAppManual =
    getLogNotificacionWhatsAppManualDelegate();

  const now = new Date();

  if (!logNotificacionWhatsAppManual) {
    await prisma.auditLog.create({
      data: {
        action: "WHATSAPP_MANUAL_OPENED",
        entityType: "PAGO",
        entityId: params.pagoId,
        administradorId: params.adminId,
        details: `Chat abierto por WhatsApp para ${params.telefonoNormalizado}`,
      },
    });

    return;
  }

  const existing = await logNotificacionWhatsAppManual.findFirst({
    where: {
      usuarioId: params.usuarioId,
      pagoId: params.pagoId,
    },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });

  await prisma.$transaction([
    ...(existing
      ? [
          logNotificacionWhatsAppManual.update({
            where: { id: existing.id },
            data: {
              administradorId: params.adminId,
              telefonoNormalizado: params.telefonoNormalizado,
              mensajeRenderizado: params.mensaje,
              waUrl: params.waUrl,
              status: "OPENED",
              openedAt: now,
            },
          }),
        ]
      : [
          logNotificacionWhatsAppManual.create({
            data: {
              usuarioId: params.usuarioId,
              pagoId: params.pagoId,
              administradorId: params.adminId,
              telefonoNormalizado: params.telefonoNormalizado,
              mensajeRenderizado: params.mensaje,
              waUrl: params.waUrl,
              status: "OPENED",
              openedAt: now,
            },
          }),
        ]),
    prisma.auditLog.create({
      data: {
        action: "WHATSAPP_MANUAL_OPENED",
        entityType: "PAGO",
        entityId: params.pagoId,
        administradorId: params.adminId,
        details: `Chat abierto por WhatsApp para ${params.telefonoNormalizado}`,
      },
    }),
  ]);
}

export async function confirmWhatsAppNotificationSent(params: {
  usuarioId: string;
  pagoId: string;
  adminId: string;
}) {
  const logNotificacionWhatsAppManual =
    getLogNotificacionWhatsAppManualDelegate();

  if (!logNotificacionWhatsAppManual) {
    throw new Error("No se pudo confirmar el envío en este entorno");
  }

  const current = await logNotificacionWhatsAppManual.findFirst({
    where: {
      usuarioId: params.usuarioId,
      pagoId: params.pagoId,
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      status: true,
      telefonoNormalizado: true,
    },
  });

  if (!current || current.status !== "OPENED") {
    throw new Error(
      "Solo se puede confirmar envío cuando el estado es Chat abierto",
    );
  }

  const now = new Date();

  await prisma.$transaction([
    logNotificacionWhatsAppManual.update({
      where: { id: current.id },
      data: {
        status: "SENT",
        sentAt: now,
      },
    }),
    prisma.auditLog.create({
      data: {
        action: "WHATSAPP_MANUAL_SENT",
        entityType: "PAGO",
        entityId: params.pagoId,
        administradorId: params.adminId,
        details: `Confirmado envío manual por WhatsApp a ${current.telefonoNormalizado}`,
      },
    }),
  ]);
}

export async function resetWhatsAppNotificationStatus(params: {
  usuarioId: string;
  pagoId: string;
  adminId: string;
}) {
  const logNotificacionWhatsAppManual =
    getLogNotificacionWhatsAppManualDelegate();

  if (!logNotificacionWhatsAppManual) {
    throw new Error("No se pudo resetear el estado en este entorno");
  }

  const current = await logNotificacionWhatsAppManual.findFirst({
    where: {
      usuarioId: params.usuarioId,
      pagoId: params.pagoId,
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      telefonoNormalizado: true,
    },
  });

  if (!current) {
    return;
  }

  await prisma.$transaction([
    logNotificacionWhatsAppManual.update({
      where: { id: current.id },
      data: {
        status: "PENDING",
        openedAt: null,
        sentAt: null,
      },
    }),
    prisma.auditLog.create({
      data: {
        action: "WHATSAPP_MANUAL_RESET",
        entityType: "PAGO",
        entityId: params.pagoId,
        administradorId: params.adminId,
        details: `Estado manual de WhatsApp reseteado para ${current.telefonoNormalizado}`,
      },
    }),
  ]);
}
