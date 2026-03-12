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

// NUEVO: Tipo para los detalles en el modal
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

// NUEVO: Interfaz para usuarios sin teléfono
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
  // NUEVOS: Campos para los modales
  pagosPagadosDetalles: PaymentDetailRow[];
  pagosPendientesDetalles: PaymentDetailRow[];
  pagosVencidosDetalles: PaymentDetailRow[];
  // NUEVO: Campo para la lista de usuarios sin teléfono
  usuariosSinTelefonoList: UsuarioSinTelefono[];
}

// ============================
// Helpers
// ============================

const MESES_CORTOS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
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

// ============================
// Main query function
// ============================

export async function getDashboardData(
  administradorId: string,
): Promise<DashboardData> {
  const now = new Date();
  const mesActual = now.getMonth() + 1;
  const añoActual = now.getFullYear();

  // Get admin name
  const admin = await prisma.administrador.findUnique({
    where: { id: administradorId },
    select: { nombre: true },
  });

  // ---- Parallel queries ----
  const [
    totalUsuarios,
    usuariosActivos,
    usuariosSinTelefono,
    pagosPagadosMes,
    pagosPendientesMes,
    pagosVencidosMes, // CORREGIDO: Ahora también filtramos por mes/año
    pagosRecientes,
    notificaciones,
    proximosVencimientos,
    pagosPorMetodo,
    pagosUltimos6Meses,
    usersDataRaw,
    // NUEVOS: Queries para detalles de modal
    detallesPagados,
    detallesPendientes,
    detallesVencidos,
  ] = await Promise.all([
    // 1. Total usuarios
    prisma.usuario.count({ where: { administradorId } }),

    // 2. Usuarios activos
    prisma.usuario.count({ where: { administradorId, estado: "ACTIVO" } }),

    prisma.usuario.count({
      where: {
        administradorId,
        OR: [{ telefono: null }, { telefono: "" }],
      },
    }),

    // 3. Monto recaudado (mes actual)
    prisma.pago.findMany({
      where: {
        usuario: { administradorId },
        mes: mesActual,
        año: añoActual,
        estado: "PAGADO",
      },
      select: { monto: true },
    }),

    // 4. Conteo pendientes (mes actual)
    prisma.pago.count({
      where: {
        usuario: { administradorId },
        mes: mesActual,
        año: añoActual,
        estado: "PENDIENTE",
      },
    }),

    // 5. Conteo vencidos (CORREGIDO: filtrado por mes actual)
    prisma.pago.count({
      where: {
        usuario: { administradorId },
        estado: "VENCIDO",
        mes: mesActual,
        año: añoActual,
      },
    }),

    // 6. Pagos recientes (general)
    prisma.pago.findMany({
      where: { usuario: { administradorId } },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            telefono: true,
            documento: true,
          },
        },
      },
      orderBy: { fecha: "desc" },
      take: 7,
    }),

    // 7. Notificaciones
    prisma.notificacion.findMany({
      where: { administradorId },
      orderBy: [{ leida: "asc" }, { fechaCreacion: "desc" }],
      take: 6,
    }),

    // 8. Proximos vencimientos (pendientes futuros)
    prisma.pago.findMany({
      where: {
        usuario: { administradorId },
        estado: "PENDIENTE",
        fechaVencimiento: { gte: now },
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            documento: true,
            telefono: true,
          },
        },
      },
      orderBy: { fechaVencimiento: "asc" },
      take: 5,
    }),

    // 9. Agrupacion por metodo
    prisma.pago.groupBy({
      by: ["metodo"],
      where: {
        usuario: { administradorId },
        mes: mesActual,
        año: añoActual,
        estado: "PAGADO",
      },
      _count: true,
    }),

    // 10. Datos para grafico (ultimos 6 meses)
    prisma.pago.findMany({
      where: {
        usuario: { administradorId },
        fecha: { gte: new Date(añoActual, mesActual - 7, 1) },
      },
      select: { monto: true, mes: true, año: true, estado: true },
    }),

    // 11. Usuarios para tabla
    prisma.usuario.findMany({
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
            mes: true,
            año: true,
            estado: true,
          },
          orderBy: [{ año: "desc" }, { mes: "desc" }],
          take: 3, // últimos 3 meses
        },
      },
      orderBy: { fechaCreacion: "desc" },
    }),

    // --- NUEVOS: Detalles para modales ---

    // 12. Detalles Pagados (Mes Actual)
    prisma.pago.findMany({
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
    }),

    // 13. Detalles Pendientes (Mes Actual)
    prisma.pago.findMany({
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
          select: {
            nombre: true,
            apellido: true,
            documento: true,
            telefono: true,
          },
        },
      },
      orderBy: { fechaVencimiento: "asc" },
    }),

    // 14. Detalles Vencidos (Mes Actual)
    prisma.pago.findMany({
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
          select: {
            nombre: true,
            apellido: true,
            documento: true,
            telefono: true,
          },
        },
      },
      orderBy: { fechaVencimiento: "asc" },
    }),
  ]);

  // NUEVA QUERY: Obtener lista de usuarios sin teléfono
  const usuariosSinTelefonoData = await prisma.usuario.findMany({
    where: {
      administradorId,
      OR: [{ telefono: null }, { telefono: "" }],
    },
    select: {
      id: true,
      nombre: true,
      apellido: true,
      documento: true,
    },
  });

  // ---- Compute KPIs ----
  const totalRecaudado = pagosPagadosMes.reduce((sum, p) => sum + p.monto, 0);

  const kpis: KpiData = {
    totalUsuarios,
    usuariosActivos,
    usuariosSinTelefono,
    totalRecaudado,
    pagosPendientes: pagosPendientesMes,
    pagosVencidos: pagosVencidosMes, // Ahora correctamente filtrado
  };

  // ---- Build monthly chart data (last 6 months) ----
  const monthlyMap = new Map<
    string,
    { pagados: number; pendientes: number; vencidos: number }
  >();
  for (let i = 5; i >= 0; i--) {
    let m = mesActual - i;
    let y = añoActual;
    if (m <= 0) {
      m += 12;
      y -= 1;
    }
    monthlyMap.set(`${y}-${m}`, { pagados: 0, pendientes: 0, vencidos: 0 });
  }

  for (const pago of pagosUltimos6Meses) {
    const key = `${pago.año}-${pago.mes}`;
    const entry = monthlyMap.get(key);
    if (entry) {
      if (pago.estado === "PAGADO") entry.pagados += pago.monto;
      else if (pago.estado === "PENDIENTE") entry.pendientes += pago.monto;
      else if (pago.estado === "VENCIDO") entry.vencidos += pago.monto;
    }
  }

  const monthlyChart: MonthlyChartData[] = [];
  for (const [key, data] of monthlyMap) {
    const [, mesStr] = key.split("-");
    const mesIndex = parseInt(mesStr, 10) - 1;
    monthlyChart.push({ mes: MESES_CORTOS[mesIndex], ...data });
  }

  // ---- Payment methods ----
  const paymentMethods: PaymentMethodData[] = pagosPorMetodo.map((entry) => ({
    name: METHOD_LABELS[entry.metodo] || entry.metodo,
    value: entry._count,
    color: METHOD_COLORS[entry.metodo] || "#6b7280",
  }));

  // ---- Recent payments ----
  const recentPaymentsData: RecentPaymentRow[] = pagosRecientes.map((p) => ({
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

  // ---- Notifications ----
  const notificationsData: NotificationRow[] = notificaciones.map((n) => ({
    id: n.id,
    tipo: n.tipo,
    titulo: n.titulo,
    mensaje: n.mensaje,
    leida: n.leida,
    fechaCreacion: n.fechaCreacion.toISOString(),
  }));

  // ---- Upcoming deadlines ----
  const upcomingDeadlinesData: UpcomingDeadlineRow[] = proximosVencimientos.map(
    (p) => {
      const venc = p.fechaVencimiento
        ? new Date(p.fechaVencimiento)
        : new Date();
      const diffMs = venc.getTime() - now.getTime();
      const diasRestantes = Math.max(
        0,
        Math.ceil(diffMs / (1000 * 60 * 60 * 24)),
      );
      return {
        usuarioId: p.usuario?.id,
        id: p.id,
        usuarioNombre: p.usuario.nombre,
        usuarioApellido: p.usuario.apellido,
        monto: p.monto,
        fechaVencimiento: venc.toISOString(),
        diasRestantes,
      };
    },
  );

  // ---- Users overview ----
  const usuariosInactivos = totalUsuarios - usuariosActivos;
  const pagaronEsteMes = pagosPagadosMes.length;
  const sinGenerar = Math.max(
    0,
    usuariosActivos - pagaronEsteMes - pagosPendientesMes,
  );

  const usersOverview: UsersOverviewData = {
    activos: usuariosActivos,
    inactivos: usuariosInactivos,
    total: totalUsuarios,
    pagaronEsteMes,
    pendientesEsteMes: pagosPendientesMes,
    vencidosEsteMes: pagosVencidosMes,
    sinGenerar,
    totalActivosParaPago: usuariosActivos,
  };

  // ---- Users for table ----
  const usersData: UserRow[] = usersDataRaw.map((user) => ({
    id: user.id,
    nombre: user.nombre,
    apellido: user.apellido,
    documento: user.documento,
    telefono: user.telefono,
    email: user.email,
    estado: user.estado,
    fechaCreacion: user.fechaCreacion.toISOString(),

    pagos: user.pagos.map((p) => ({
      mes: MESES_CORTOS[p.mes - 1],
      estado: p.estado,
    })),
  }));

  // ---- NUEVOS: Map details for modals ----
  const pagosPagadosDetalles: PaymentDetailRow[] = detallesPagados.map((p) => ({
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

  const pagosPendientesDetalles: PaymentDetailRow[] = detallesPendientes.map(
    (p) => ({
      id: p.id,
      usuarioNombre: p.usuario.nombre,
      usuarioApellido: p.usuario.apellido,
      monto: p.monto,
      fechaVencimiento: p.fechaVencimiento
        ? p.fechaVencimiento.toISOString()
        : null,
      fechaPago: null,
      estado: "PENDIENTE",
      telefono: p.usuario.telefono,
      documento: p.usuario.documento,
    }),
  );

  const pagosVencidosDetalles: PaymentDetailRow[] = detallesVencidos.map(
    (p) => ({
      id: p.id,
      usuarioNombre: p.usuario.nombre,
      usuarioApellido: p.usuario.apellido,
      monto: p.monto,
      fechaVencimiento: p.fechaVencimiento
        ? p.fechaVencimiento.toISOString()
        : null,
      fechaPago: null,
      estado: "VENCIDO",
      telefono: p.usuario.telefono,
      documento: p.usuario.documento,
    }),
  );

  return {
    adminNombre: admin?.nombre ?? "Profesor",
    kpis,
    monthlyChart,
    paymentMethods,
    recentPayments: recentPaymentsData,
    notifications: notificationsData,
    upcomingDeadlines: upcomingDeadlinesData,
    usersOverview,
    users: usersData,
    // Retornar nuevos datos
    pagosPagadosDetalles,
    pagosPendientesDetalles,
    pagosVencidosDetalles,
    // NUEVO: Preparar datos para retornar
    usuariosSinTelefonoList: usuariosSinTelefonoData,
  };
}
