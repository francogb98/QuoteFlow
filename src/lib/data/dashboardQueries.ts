"use server";

import prisma from "@/lib/prisma";

// ============================
// Types for Dashboard Data
// ============================

export interface KpiData {
  totalUsuarios: number;
  usuariosActivos: number;
  usuariosSinTelefono: number;
  totalRecaudado: number;
  pagosPendientes: number;
  pagosVencidos: number;
}
export interface MonthlyChartData {
  mes: string;
  pagados: number;
  pendientes: number;
  vencidos: number;
}

export interface PaymentMethodData {
  name: string;
  value: number;
  color: string;
}

export interface RecentPaymentRow {
  id: string;
  usuarioId?: string;
  usuarioNombre: string;
  usuarioApellido: string;
  monto: number;
  estado: "PAGADO" | "PENDIENTE" | "VENCIDO" | "RECHAZADO";
  metodo: "EFECTIVO" | "MERCADOPAGO" | "TRANSFERENCIA" | "TARJETA";
  periodo: string;
  fecha: string;
}

export interface PaymentDetailRow {
  id: string;
  usuarioNombre: string;
  usuarioApellido: string;
  monto: number;
  fechaVencimiento: string | null;
  fechaPago: string | null;
  estado: string;
  telefono?: string | null;
  documento?: string | null;
}

export interface NotificationRow {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fechaCreacion: string;
}

export interface UpcomingDeadlineRow {
  usuarioId?: string;
  id: string;
  usuarioNombre: string;
  usuarioApellido: string;
  monto: number;
  fechaVencimiento: string;
  diasRestantes: number;
}

export interface UsersOverviewData {
  activos: number;
  inactivos: number;
  total: number;
  pagaronEsteMes: number;
  pendientesEsteMes: number;
  vencidosEsteMes: number;
  sinGenerar: number;
  totalActivosParaPago: number;
}

export interface UserRow {
  id: string;
  nombre: string;
  apellido: string;
  documento: string;
  telefono: string | null;
  email: string | null;
  estado: string;
  fechaCreacion: string;
}

export interface UsuarioSinTelefono {
  id: string;
  nombre: string;
  apellido: string;
  documento?: string | null;
}

export interface DashboardData {
  adminNombre: string;
  kpis: KpiData;
  monthlyChart: MonthlyChartData[];
  paymentMethods: PaymentMethodData[];
  recentPayments: RecentPaymentRow[];
  notifications: NotificationRow[];
  upcomingDeadlines: UpcomingDeadlineRow[];
  usersOverview: UsersOverviewData;
  users: UserRow[];
  pagosPagadosDetalles: PaymentDetailRow[];
  pagosPendientesDetalles: PaymentDetailRow[];
  pagosVencidosDetalles: PaymentDetailRow[];
  usuariosSinTelefonoList: UsuarioSinTelefono[];
}

// ============================
// Helpers
// ============================

const MESES_CORTOS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

const METHOD_COLORS: Record<string, string> = {
  EFECTIVO: "#10b981",
  MERCADOPAGO: "#7c3aed",
  TRANSFERENCIA: "#3b82f6",
  TARJETA: "#f59e0b",
};

const METHOD_LABELS: Record<string, string> = {
  EFECTIVO: "Efectivo",
  MERCADOPAGO: "MercadoPago",
  TRANSFERENCIA: "Transferencia",
  TARJETA: "Tarjeta",
};

const USUARIOS_TABLE_LIMIT = 50;

// ============================
// Sub-queries (each returns raw Prisma data)
// ============================

async function fetchKpiCounts(administradorId: string, mesActual: number, añoActual: number) {
  const [totalUsuarios, usuariosActivos, usuariosSinTelefono, pagosPendientesMes, pagosVencidosMes] =
    await Promise.all([
      prisma.usuario.count({ where: { administradorId } }),
      prisma.usuario.count({ where: { administradorId, estado: "ACTIVO" } }),
      prisma.usuario.count({
        where: { administradorId, OR: [{ telefono: null }, { telefono: "" }] },
      }),
      prisma.pago.count({
        where: {
          usuario: { administradorId },
          mes: mesActual,
          año: añoActual,
          estado: "PENDIENTE",
        },
      }),
      prisma.pago.count({
        where: {
          usuario: { administradorId },
          estado: "VENCIDO",
          mes: mesActual,
          año: añoActual,
        },
      }),
    ]);

  return { totalUsuarios, usuariosActivos, usuariosSinTelefono, pagosPendientesMes, pagosVencidosMes };
}

async function fetchPagosPagadosDetalles(administradorId: string, mesActual: number, añoActual: number) {
  return prisma.pago.findMany({
    where: {
      usuario: { administradorId },
      mes: mesActual,
      año: añoActual,
      estado: "PAGADO",
    },
    select: {
      id: true,
      monto: true,
      fecha: true,
      usuario: {
        select: {
          nombre: true,
          apellido: true,
          telefono: true,
          documento: true,
        },
      },
    },
    orderBy: { fecha: "desc" },
  });
}

async function fetchPagosPendientesDetalles(administradorId: string, mesActual: number, añoActual: number) {
  return prisma.pago.findMany({
    where: {
      usuario: { administradorId },
      mes: mesActual,
      año: añoActual,
      estado: "PENDIENTE",
    },
    select: {
      id: true,
      monto: true,
      fechaVencimiento: true,
      usuario: {
        select: { nombre: true, apellido: true, documento: true, telefono: true },
      },
    },
    orderBy: { fechaVencimiento: "asc" },
  });
}

async function fetchPagosVencidosDetalles(administradorId: string, mesActual: number, añoActual: number) {
  return prisma.pago.findMany({
    where: {
      usuario: { administradorId },
      mes: mesActual,
      año: añoActual,
      estado: "VENCIDO",
    },
    select: {
      id: true,
      monto: true,
      fechaVencimiento: true,
      usuario: {
        select: { nombre: true, apellido: true, documento: true, telefono: true },
      },
    },
    orderBy: { fechaVencimiento: "asc" },
  });
}

async function fetchRecentPayments(administradorId: string) {
  return prisma.pago.findMany({
    where: { usuario: { administradorId } },
    include: {
      usuario: {
        select: { id: true, nombre: true, apellido: true, telefono: true, documento: true },
      },
    },
    orderBy: { fecha: "desc" },
    take: 7,
  });
}

async function fetchNotifications(administradorId: string) {
  return prisma.notificacion.findMany({
    where: { administradorId },
    orderBy: [{ leida: "asc" }, { fechaCreacion: "desc" }],
    take: 6,
  });
}

async function fetchUpcomingDeadlines(administradorId: string, now: Date) {
  return prisma.pago.findMany({
    where: {
      usuario: { administradorId },
      estado: "PENDIENTE",
      fechaVencimiento: { gte: now },
    },
    include: {
      usuario: {
        select: { id: true, nombre: true, apellido: true, documento: true, telefono: true },
      },
    },
    orderBy: { fechaVencimiento: "asc" },
    take: 5,
  });
}

async function fetchPaymentMethodsByMonth(administradorId: string, mesActual: number, añoActual: number) {
  return prisma.pago.groupBy({
    by: ["metodo"],
    where: {
      usuario: { administradorId },
      mes: mesActual,
      año: añoActual,
      estado: "PAGADO",
    },
    _count: true,
  });
}

async function fetchPaymentsLast6Months(administradorId: string, mesActual: number, añoActual: number) {
  return prisma.pago.findMany({
    where: {
      usuario: { administradorId },
      fecha: { gte: new Date(añoActual, mesActual - 7, 1) },
    },
    select: { monto: true, mes: true, año: true, estado: true },
  });
}

async function fetchUsersForTable(administradorId: string) {
  return prisma.usuario.findMany({
    where: { administradorId },
    select: {
      id: true,
      nombre: true,
      apellido: true,
      documento: true,
      telefono: true,
      email: true,
      estado: true,
      fechaCreacion: true,
      pagos: {
        select: {
          id: true,
          mes: true,
          año: true,
          estado: true,
          monto: true,
          metodo: true,
        },
        orderBy: [{ año: "desc" }, { mes: "desc" }],
        take: 3,
      },
    },
    orderBy: { fechaCreacion: "desc" },
    take: USUARIOS_TABLE_LIMIT,
  });
}

async function fetchUsuariosSinTelefono(administradorId: string) {
  return prisma.usuario.findMany({
    where: {
      administradorId,
      OR: [{ telefono: null }, { telefono: "" }],
    },
    select: { id: true, nombre: true, apellido: true, documento: true },
  });
}

// ============================
// Mappers (raw data → typed rows)
// ============================

function mapPagosPagadosDetalles(
  detalles: Awaited<ReturnType<typeof fetchPagosPagadosDetalles>>
): PaymentDetailRow[] {
  return detalles.map((p) => ({
    id: p.id,
    usuarioNombre: p.usuario.nombre,
    usuarioApellido: p.usuario.apellido,
    monto: p.monto,
    fechaVencimiento: null,
    fechaPago: p.fecha ? p.fecha.toISOString() : null,
    estado: "PAGADO",
    telefono: p.usuario.telefono,
    documento: p.usuario.documento,
  }));
}

function mapPagosPendientesDetalles(
  detalles: Awaited<ReturnType<typeof fetchPagosPendientesDetalles>>
): PaymentDetailRow[] {
  return detalles.map((p) => ({
    id: p.id,
    usuarioNombre: p.usuario.nombre,
    usuarioApellido: p.usuario.apellido,
    monto: p.monto,
    fechaVencimiento: p.fechaVencimiento ? p.fechaVencimiento.toISOString() : null,
    fechaPago: null,
    estado: "PENDIENTE",
    telefono: p.usuario.telefono,
    documento: p.usuario.documento,
  }));
}

function mapPagosVencidosDetalles(
  detalles: Awaited<ReturnType<typeof fetchPagosVencidosDetalles>>
): PaymentDetailRow[] {
  return detalles.map((p) => ({
    id: p.id,
    usuarioNombre: p.usuario.nombre,
    usuarioApellido: p.usuario.apellido,
    monto: p.monto,
    fechaVencimiento: p.fechaVencimiento ? p.fechaVencimiento.toISOString() : null,
    fechaPago: null,
    estado: "VENCIDO",
    telefono: p.usuario.telefono,
    documento: p.usuario.documento,
  }));
}

function mapMonthlyChart(
  pagos: Awaited<ReturnType<typeof fetchPaymentsLast6Months>>,
  mesActual: number,
  añoActual: number
): MonthlyChartData[] {
  const monthlyMap = new Map<string, { pagados: number; pendientes: number; vencidos: number }>();
  for (let i = 5; i >= 0; i--) {
    let m = mesActual - i;
    let y = añoActual;
    if (m <= 0) { m += 12; y -= 1; }
    monthlyMap.set(`${y}-${m}`, { pagados: 0, pendientes: 0, vencidos: 0 });
  }

  for (const pago of pagos) {
    const entry = monthlyMap.get(`${pago.año}-${pago.mes}`);
    if (entry) {
      if (pago.estado === "PAGADO") entry.pagados += pago.monto;
      else if (pago.estado === "PENDIENTE") entry.pendientes += pago.monto;
      else if (pago.estado === "VENCIDO") entry.vencidos += pago.monto;
    }
  }

  const chart: MonthlyChartData[] = [];
  for (const [key, data] of monthlyMap) {
    const mesIndex = parseInt(key.split("-")[1], 10) - 1;
    chart.push({ mes: MESES_CORTOS[mesIndex], ...data });
  }
  return chart;
}

function mapPaymentMethods(
  pagosPorMetodo: Awaited<ReturnType<typeof fetchPaymentMethodsByMonth>>
): PaymentMethodData[] {
  return pagosPorMetodo.map((entry) => ({
    name: METHOD_LABELS[entry.metodo] || entry.metodo,
    value: entry._count,
    color: METHOD_COLORS[entry.metodo] || "#6b7280",
  }));
}

function mapRecentPayments(
  pagosRecientes: Awaited<ReturnType<typeof fetchRecentPayments>>
): RecentPaymentRow[] {
  return pagosRecientes.map((p) => ({
    id: p.id,
    usuarioId: p.usuario?.id,
    usuarioNombre: p.usuario.nombre,
    usuarioApellido: p.usuario.apellido,
    monto: p.monto,
    estado: p.estado,
    metodo: p.metodo,
    periodo: p.periodo,
    fecha: p.fecha.toISOString(),
  }));
}

function mapNotifications(
  notificaciones: Awaited<ReturnType<typeof fetchNotifications>>
): NotificationRow[] {
  return notificaciones.map((n) => ({
    id: n.id,
    tipo: n.tipo,
    titulo: n.titulo,
    mensaje: n.mensaje,
    leida: n.leida,
    fechaCreacion: n.fechaCreacion.toISOString(),
  }));
}

function mapUpcomingDeadlines(
  proximosVencimientos: Awaited<ReturnType<typeof fetchUpcomingDeadlines>>,
  now: Date
): UpcomingDeadlineRow[] {
  return proximosVencimientos.map((p) => {
    const venc = p.fechaVencimiento ? new Date(p.fechaVencimiento) : new Date();
    const diffMs = venc.getTime() - now.getTime();
    const diasRestantes = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    return {
      usuarioId: p.usuario?.id,
      id: p.id,
      usuarioNombre: p.usuario.nombre,
      usuarioApellido: p.usuario.apellido,
      monto: p.monto,
      fechaVencimiento: venc.toISOString(),
      diasRestantes,
    };
  });
}

function mapUsersForTable(
  usersDataRaw: Awaited<ReturnType<typeof fetchUsersForTable>>
): UserRow[] {
  return usersDataRaw.map((user) => ({
    id: user.id,
    nombre: user.nombre,
    apellido: user.apellido,
    documento: user.documento,
    telefono: user.telefono,
    email: user.email,
    estado: user.estado,
    fechaCreacion: user.fechaCreacion.toISOString(),
    pagos: user.pagos.map((p) => ({
      id: p.id,
      mes: MESES_CORTOS[p.mes - 1],
      monto: p.monto,
      estado: p.estado,
      metodo: p.metodo,
    })),
  }));
}

// ============================
// Main query function
// ============================

export async function getDashboardData(
  administradorId: string,
): Promise<DashboardData> {
  const now = new Date();
  const mesActual = now.getMonth() + 1;
  const añoActual = now.getFullYear();

  const admin = await prisma.administrador.findUnique({
    where: { id: administradorId },
    select: { nombre: true },
  });

  // ---- Parallel queries (batched for clarity) ----
  const [kpiCounts, pagosPagados, detallesPendientes, detallesVencidos] =
    await Promise.all([
      fetchKpiCounts(administradorId, mesActual, añoActual),
      fetchPagosPagadosDetalles(administradorId, mesActual, añoActual),
      fetchPagosPendientesDetalles(administradorId, mesActual, añoActual),
      fetchPagosVencidosDetalles(administradorId, mesActual, añoActual),
    ]);

  const [pagosRecientes, notificaciones, proximosVencimientos, pagosPorMetodo, pagosUltimos6Meses, usersDataRaw, usuariosSinTelefonoData] =
    await Promise.all([
      fetchRecentPayments(administradorId),
      fetchNotifications(administradorId),
      fetchUpcomingDeadlines(administradorId, now),
      fetchPaymentMethodsByMonth(administradorId, mesActual, añoActual),
      fetchPaymentsLast6Months(administradorId, mesActual, añoActual),
      fetchUsersForTable(administradorId),
      fetchUsuariosSinTelefono(administradorId),
    ]);

  // ---- Compute KPIs ----
  const totalRecaudado = pagosPagados.reduce((sum, p) => sum + p.monto, 0);

  const kpis: KpiData = {
    totalUsuarios: kpiCounts.totalUsuarios,
    usuariosActivos: kpiCounts.usuariosActivos,
    usuariosSinTelefono: kpiCounts.usuariosSinTelefono,
    totalRecaudado,
    pagosPendientes: kpiCounts.pagosPendientesMes,
    pagosVencidos: kpiCounts.pagosVencidosMes,
  };

  // ---- Users overview ----
  const pagaronEsteMes = pagosPagados.length;
  const sinGenerar = Math.max(
    0,
    kpiCounts.usuariosActivos - pagaronEsteMes - kpiCounts.pagosPendientesMes,
  );

  const usersOverview: UsersOverviewData = {
    activos: kpiCounts.usuariosActivos,
    inactivos: kpiCounts.totalUsuarios - kpiCounts.usuariosActivos,
    total: kpiCounts.totalUsuarios,
    pagaronEsteMes,
    pendientesEsteMes: kpiCounts.pagosPendientesMes,
    vencidosEsteMes: kpiCounts.pagosVencidosMes,
    sinGenerar,
    totalActivosParaPago: kpiCounts.usuariosActivos,
  };

  return {
    adminNombre: admin?.nombre ?? "Profesor",
    kpis,
    monthlyChart: mapMonthlyChart(pagosUltimos6Meses, mesActual, añoActual),
    paymentMethods: mapPaymentMethods(pagosPorMetodo),
    recentPayments: mapRecentPayments(pagosRecientes),
    notifications: mapNotifications(notificaciones),
    upcomingDeadlines: mapUpcomingDeadlines(proximosVencimientos, now),
    usersOverview,
    users: mapUsersForTable(usersDataRaw),
    pagosPagadosDetalles: mapPagosPagadosDetalles(pagosPagados),
    pagosPendientesDetalles: mapPagosPendientesDetalles(detallesPendientes),
    pagosVencidosDetalles: mapPagosVencidosDetalles(detallesVencidos),
    usuariosSinTelefonoList: usuariosSinTelefonoData,
  };
}
