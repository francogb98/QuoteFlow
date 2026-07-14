import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;
const RECENT_ACTIVITY_DAYS = 14;
const STALE_ACTIVITY_DAYS = 30;
const EXPIRING_SOON_DAYS = 7;

export type CompanySubscriptionStatus =
  | "ACTIVA"
  | "VENCIDA"
  | "TRIAL"
  | "CANCELADA"
  | "PENDIENTE"
  | "SIN_DATOS";

export type CompanyPaymentStatus = "AL_DIA" | "ATRASADO";
export type CompanyActivityStatus = "ACTIVA" | "ATENCION" | "INACTIVA";
export type ActivityFilter = "all" | "recent" | "stale" | "none";

export interface SuperAdminCompaniesFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  subscriptionStatus?: CompanySubscriptionStatus | "all";
  paymentStatus?: CompanyPaymentStatus | "all";
  activity?: ActivityFilter;
}

export interface SuperAdminOverview {
  totalCompanies: number;
  activeCompanies: number;
  overdueCompanies: number;
  trialCompanies: number;
  totalUsers: number;
  expiringSoonCompanies: number;
}

export interface SuperAdminCompanyListItem {
  id: string;
  nombre: string;
  contactEmail: string | null;
  subscriptionStatus: CompanySubscriptionStatus;
  paymentStatus: CompanyPaymentStatus;
  activityStatus: CompanyActivityStatus;
  accountStatus: "ACTIVA" | "SUSPENDIDA";
  planTipo: string;
  frecuenciaPago: string | null;
  fechaInicioSuscripcion: Date | null;
  fechaFinPeriodoActual: Date | null;
  fechaUltimoPago: Date | null;
  fechaProximoVencimiento: Date | null;
  usuariosActivos: number;
  lastActivity: Date | null;
  healthScore: number;
  primaryAdminEmail: string | null;
}

export interface SuperAdminCompaniesResult {
  companies: SuperAdminCompanyListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SuperAdminCompanyDetail {
  company: SuperAdminCompanyListItem & {
    createdAt: Date;
    updatedAt: Date;
    totalAdmins: number;
    activeAdmins: number;
    totalUsers: number;
    totalOperations: number;
    totalSubscriptionRevenue: number;
  };
  admins: Array<{
    id: string;
    nombre: string;
    email: string;
    rol: string;
    estaActivo: boolean;
    fechaCreacion: Date;
  }>;
  users: Array<{
    id: string;
    nombre: string;
    apellido: string;
    email: string | null;
    estado: string;
    estaActivo: boolean;
    fechaCreacion: Date;
    adminNombre: string;
  }>;
  paymentHistory: Array<{
    id: string;
    monto: number;
    estadoMercadoPago: string;
    fechaPago: Date;
    mercadoPagoPaymentId: string;
  }>;
  logs: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    details: string | null;
    createdAt: Date;
    adminNombre: string | null;
  }>;
}

function clampPageSize(pageSize?: number) {
  if (!pageSize || Number.isNaN(pageSize)) {
    return DEFAULT_PAGE_SIZE;
  }

  return Math.min(Math.max(pageSize, 1), MAX_PAGE_SIZE);
}

function clampPage(page?: number) {
  if (!page || Number.isNaN(page)) {
    return 1;
  }

  return Math.max(page, 1);
}

function getDaysUntil(date: Date | null | undefined) {
  if (!date) {
    return null;
  }

  const diff = date.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getSubscriptionStatus(company: {
  esCuentaPrueba: boolean;
  suscripcion: {
    estadoSuscripcion: string;
    fechaFinPeriodoActual: Date | null;
  } | null;
}): CompanySubscriptionStatus {
  if (!company.suscripcion) {
    return company.esCuentaPrueba ? "TRIAL" : "SIN_DATOS";
  }

  const explicitStatus = company.suscripcion
    .estadoSuscripcion as CompanySubscriptionStatus;
  if (explicitStatus === "TRIAL") {
    return "TRIAL";
  }

  if (
    company.suscripcion.fechaFinPeriodoActual &&
    company.suscripcion.fechaFinPeriodoActual.getTime() < Date.now() &&
    explicitStatus !== "CANCELADA"
  ) {
    return "VENCIDA";
  }

  return explicitStatus;
}

function getPaymentStatus(company: {
  estadoPago: string;
  fechaProximoVencimiento: Date | null;
  suscripcion: {
    estadoSuscripcion: string;
    estadoPagoMercadoPago: string | null;
  } | null;
}): CompanyPaymentStatus {
  const overdueByState = company.estadoPago === "INACTIVO_POR_FALTA_DE_PAGO";
  const overdueBySubscription =
    company.suscripcion?.estadoSuscripcion === "VENCIDA";
  const overdueByGateway = ["CANCELLED", "REJECTED"].includes(
    company.suscripcion?.estadoPagoMercadoPago ?? "",
  );
  const overdueByDate =
    !!company.fechaProximoVencimiento &&
    company.fechaProximoVencimiento.getTime() < Date.now();

  return overdueByState ||
    overdueBySubscription ||
    overdueByGateway ||
    overdueByDate
    ? "ATRASADO"
    : "AL_DIA";
}

function getActivityStatus(lastActivity: Date | null): CompanyActivityStatus {
  if (!lastActivity) {
    return "INACTIVA";
  }

  const daysSinceActivity = Math.floor(
    (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysSinceActivity <= RECENT_ACTIVITY_DAYS) {
    return "ACTIVA";
  }

  if (daysSinceActivity <= STALE_ACTIVITY_DAYS) {
    return "ATENCION";
  }

  return "INACTIVA";
}

function getHealthScore(args: {
  accountStatus: "ACTIVA" | "SUSPENDIDA";
  paymentStatus: CompanyPaymentStatus;
  activityStatus: CompanyActivityStatus;
  fechaFinPeriodoActual: Date | null;
}) {
  let score = 100;

  if (args.accountStatus === "SUSPENDIDA") {
    score -= 40;
  }

  if (args.paymentStatus === "ATRASADO") {
    score -= 35;
  }

  if (args.activityStatus === "ATENCION") {
    score -= 15;
  }

  if (args.activityStatus === "INACTIVA") {
    score -= 30;
  }

  const daysUntilEnd = getDaysUntil(args.fechaFinPeriodoActual);
  if (
    daysUntilEnd !== null &&
    daysUntilEnd >= 0 &&
    daysUntilEnd <= EXPIRING_SOON_DAYS
  ) {
    score -= 10;
  }

  return Math.max(0, Math.min(score, 100));
}

function buildCompaniesWhere(
  filters: SuperAdminCompaniesFilters,
): Prisma.EmpresaWhereInput {
  const where: Prisma.EmpresaWhereInput = {};
  const andClauses: Prisma.EmpresaWhereInput[] = [];
  const search = filters.search?.trim();
  const recentThreshold = new Date(
    Date.now() - RECENT_ACTIVITY_DAYS * 24 * 60 * 60 * 1000,
  );

  if (search) {
    andClauses.push({
      OR: [
        { nombre: { contains: search, mode: "insensitive" } },
        { contactEmail: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (filters.subscriptionStatus && filters.subscriptionStatus !== "all") {
    if (filters.subscriptionStatus === "TRIAL") {
      andClauses.push({
        OR: [
          { esCuentaPrueba: true },
          { suscripcion: { is: { estadoSuscripcion: "TRIAL" } } },
        ],
      });
    } else if (filters.subscriptionStatus === "SIN_DATOS") {
      where.suscripcion = { is: null };
    } else {
      where.suscripcion = {
        is: { estadoSuscripcion: filters.subscriptionStatus },
      };
    }
  }

  const latePaymentClause: Prisma.EmpresaWhereInput = {
    OR: [
      { estadoPago: "INACTIVO_POR_FALTA_DE_PAGO" },
      { fechaProximoVencimiento: { lt: new Date() } },
      { suscripcion: { is: { estadoSuscripcion: "VENCIDA" } } },
      {
        suscripcion: {
          is: {
            estadoPagoMercadoPago: {
              in: ["CANCELLED", "REJECTED"],
            },
          },
        },
      },
    ],
  };

  if (filters.paymentStatus === "ATRASADO") {
    andClauses.push(latePaymentClause);
  }

  if (filters.paymentStatus === "AL_DIA") {
    andClauses.push({ NOT: latePaymentClause });
  }

  if (filters.activity === "recent") {
    where.administradores = {
      some: {
        logs: {
          some: {
            createdAt: { gte: recentThreshold },
          },
        },
      },
    };
  }

  if (filters.activity === "stale") {
    andClauses.push({
      administradores: {
        some: {
          logs: {
            some: {},
          },
        },
        none: {
          logs: {
            some: {
              createdAt: { gte: recentThreshold },
            },
          },
        },
      },
    });
  }

  if (filters.activity === "none") {
    where.administradores = {
      every: {
        logs: {
          none: {},
        },
      },
    };
  }

  if (andClauses.length > 0) {
    const existingAnd =
      Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : [];
    where.AND = [...existingAnd, ...andClauses];
  }

  return where;
}

function buildCompanyItem(args: {
  company: {
    id: string;
    nombre: string;
    contactEmail: string | null;
    planTipo: string;
    estadoPago: string;
    fechaUltimoPago: Date | null;
    fechaProximoVencimiento: Date | null;
    estaActiva: boolean;
    esCuentaPrueba: boolean;
    suscripcion: {
      planTipo: string;
      frecuenciaPago: string;
      estadoSuscripcion: string;
      estadoPagoMercadoPago: string | null;
      fechaInicio: Date;
      fechaFinPeriodoActual: Date | null;
    } | null;
    administradores: Array<{
      id: string;
      email: string;
      fechaCreacion: Date;
    }>;
  };
  activeUsersCount: number;
  lastActivity: Date | null;
}): SuperAdminCompanyListItem {
  const subscriptionStatus = getSubscriptionStatus(args.company);
  const paymentStatus = getPaymentStatus(args.company);
  const accountStatus = args.company.estaActiva ? "ACTIVA" : "SUSPENDIDA";
  const activityStatus = getActivityStatus(args.lastActivity);
  const primaryAdminEmail = args.company.administradores[0]?.email ?? null;
  const contactEmail = args.company.contactEmail ?? primaryAdminEmail;
  const healthScore = getHealthScore({
    accountStatus,
    paymentStatus,
    activityStatus,
    fechaFinPeriodoActual:
      args.company.suscripcion?.fechaFinPeriodoActual ?? null,
  });

  return {
    id: args.company.id,
    nombre: args.company.nombre,
    contactEmail,
    subscriptionStatus,
    paymentStatus,
    activityStatus,
    accountStatus,
    planTipo: args.company.suscripcion?.planTipo ?? args.company.planTipo,
    frecuenciaPago: args.company.suscripcion?.frecuenciaPago ?? null,
    fechaInicioSuscripcion: args.company.suscripcion?.fechaInicio ?? null,
    fechaFinPeriodoActual:
      args.company.suscripcion?.fechaFinPeriodoActual ?? null,
    fechaUltimoPago: args.company.fechaUltimoPago,
    fechaProximoVencimiento: args.company.fechaProximoVencimiento,
    usuariosActivos: args.activeUsersCount,
    lastActivity: args.lastActivity,
    healthScore,
    primaryAdminEmail,
  };
}

export async function getSuperAdminOverview(): Promise<SuperAdminOverview> {
  const today = new Date();
  const expiringSoonDate = new Date(
    Date.now() + EXPIRING_SOON_DAYS * 24 * 60 * 60 * 1000,
  );

  const overdueWhere: Prisma.EmpresaWhereInput = {
    OR: [
      { estadoPago: "INACTIVO_POR_FALTA_DE_PAGO" },
      { fechaProximoVencimiento: { lt: today } },
      { suscripcion: { is: { estadoSuscripcion: "VENCIDA" } } },
    ],
  };

  const [
    totalCompanies,
    activeCompanies,
    overdueCompanies,
    trialCompanies,
    totalUsers,
    expiringSoonCompanies,
  ] = await Promise.all([
    prisma.empresa.count(),
    prisma.empresa.count({ where: { estaActiva: true } }),
    prisma.empresa.count({ where: overdueWhere }),
    prisma.empresa.count({
      where: {
        OR: [
          { esCuentaPrueba: true },
          { suscripcion: { is: { estadoSuscripcion: "TRIAL" } } },
        ],
      },
    }),
    prisma.usuario.count(),
    prisma.empresa.count({
      where: {
        fechaProximoVencimiento: {
          gte: today,
          lte: expiringSoonDate,
        },
      },
    }),
  ]);

  return {
    totalCompanies,
    activeCompanies,
    overdueCompanies,
    trialCompanies,
    totalUsers,
    expiringSoonCompanies,
  };
}

export async function getSuperAdminCompanies(
  filters: SuperAdminCompaniesFilters = {},
): Promise<SuperAdminCompaniesResult> {
  const page = clampPage(filters.page);
  const pageSize = clampPageSize(filters.pageSize);
  const where = buildCompaniesWhere(filters);

  const [companies, total] = await Promise.all([
    prisma.empresa.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: [
        { estaActiva: "asc" },
        { fechaProximoVencimiento: "asc" },
        { nombre: "asc" },
      ],
      select: {
        id: true,
        nombre: true,
        contactEmail: true,
        planTipo: true,
        estadoPago: true,
        fechaUltimoPago: true,
        fechaProximoVencimiento: true,
        estaActiva: true,
        esCuentaPrueba: true,
        suscripcion: {
          select: {
            planTipo: true,
            frecuenciaPago: true,
            estadoSuscripcion: true,
            estadoPagoMercadoPago: true,
            fechaInicio: true,
            fechaFinPeriodoActual: true,
          },
        },
        administradores: {
          orderBy: { fechaCreacion: "asc" },
          select: {
            id: true,
            email: true,
            fechaCreacion: true,
          },
        },
      },
    }),
    prisma.empresa.count({ where }),
  ]);

  const companyIds = companies.map((company) => company.id);
  const companyByAdminId = new Map<string, string>();
  const adminIds = companies.flatMap((company) =>
    company.administradores.map((admin) => {
      companyByAdminId.set(admin.id, company.id);
      return admin.id;
    }),
  );

  const [activeUsersByAdmin, lastLogsByAdmin] = adminIds.length
    ? await Promise.all([
        prisma.usuario.groupBy({
          by: ["administradorId"],
          where: {
            administradorId: { in: adminIds },
            estaActivo: true,
            estado: "ACTIVO",
          },
          _count: { _all: true },
        }),
        prisma.auditLog.groupBy({
          by: ["administradorId"],
          where: {
            administradorId: { in: adminIds },
          },
          _max: { createdAt: true },
        }),
      ])
    : [[], []];

  const activeUsersByCompany = new Map<string, number>();
  for (const row of activeUsersByAdmin) {
    const companyId = companyByAdminId.get(row.administradorId);
    if (!companyId) {
      continue;
    }

    activeUsersByCompany.set(
      companyId,
      (activeUsersByCompany.get(companyId) ?? 0) + row._count._all,
    );
  }

  const lastActivityByCompany = new Map<string, Date>();
  for (const row of lastLogsByAdmin) {
    if (!row.administradorId || !row._max.createdAt) {
      continue;
    }

    const companyId = companyByAdminId.get(row.administradorId);
    if (!companyId) {
      continue;
    }

    const currentLast = lastActivityByCompany.get(companyId);
    if (!currentLast || row._max.createdAt > currentLast) {
      lastActivityByCompany.set(companyId, row._max.createdAt);
    }
  }

  const items = companies
    .map((company) =>
      buildCompanyItem({
        company,
        activeUsersCount: activeUsersByCompany.get(company.id) ?? 0,
        lastActivity: lastActivityByCompany.get(company.id) ?? null,
      }),
    )
    .sort((left, right) => {
      const leftSeverity =
        (left.accountStatus === "SUSPENDIDA" ? 3 : 0) +
        (left.paymentStatus === "ATRASADO" ? 3 : 0) +
        (left.activityStatus === "INACTIVA"
          ? 2
          : left.activityStatus === "ATENCION"
            ? 1
            : 0) +
        (100 - left.healthScore) / 25;
      const rightSeverity =
        (right.accountStatus === "SUSPENDIDA" ? 3 : 0) +
        (right.paymentStatus === "ATRASADO" ? 3 : 0) +
        (right.activityStatus === "INACTIVA"
          ? 2
          : right.activityStatus === "ATENCION"
            ? 1
            : 0) +
        (100 - right.healthScore) / 25;

      if (leftSeverity !== rightSeverity) {
        return rightSeverity - leftSeverity;
      }

      return left.nombre.localeCompare(right.nombre, "es");
    });

  return {
    companies: items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getSuperAdminCompanyDetail(
  companyId: string,
): Promise<SuperAdminCompanyDetail | null> {
  const company = await prisma.empresa.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      nombre: true,
      contactEmail: true,
      planTipo: true,
      estadoPago: true,
      fechaUltimoPago: true,
      fechaProximoVencimiento: true,
      fechaCreacion: true,
      fechaActualizacion: true,
      estaActiva: true,
      esCuentaPrueba: true,
      suscripcion: {
        select: {
          planTipo: true,
          frecuenciaPago: true,
          estadoSuscripcion: true,
          estadoPagoMercadoPago: true,
          fechaInicio: true,
          fechaFinPeriodoActual: true,
        },
      },
      administradores: {
        orderBy: [{ estaActivo: "desc" }, { fechaCreacion: "asc" }],
        select: {
          id: true,
          nombre: true,
          email: true,
          rol: true,
          estaActivo: true,
          fechaCreacion: true,
        },
      },
    },
  });

  if (!company) {
    return null;
  }

  const adminIds = company.administradores.map((admin) => admin.id);

  const [
    userRows,
    totalUsers,
    activeUsers,
    subscriptionPayments,
    totalSubscriptionPayments,
    subscriptionRevenue,
    totalUserPayments,
    logs,
    totalLogs,
  ] = await Promise.all([
    prisma.usuario.findMany({
      where: {
        administradorId: { in: adminIds.length ? adminIds : ["__none__"] },
      },
      orderBy: { fechaCreacion: "desc" },
      take: 20,
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        estado: true,
        estaActivo: true,
        fechaCreacion: true,
        administrador: {
          select: {
            nombre: true,
          },
        },
      },
    }),
    prisma.usuario.count({
      where: {
        administradorId: { in: adminIds.length ? adminIds : ["__none__"] },
      },
    }),
    prisma.usuario.count({
      where: {
        administradorId: { in: adminIds.length ? adminIds : ["__none__"] },
        estaActivo: true,
        estado: "ACTIVO",
      },
    }),
    prisma.pagoSuscripcionEmpresa.findMany({
      where: { empresaId: companyId },
      orderBy: { fechaPago: "desc" },
      take: 12,
      select: {
        id: true,
        monto: true,
        estadoMercadoPago: true,
        fechaPago: true,
        mercadoPagoPaymentId: true,
      },
    }),
    prisma.pagoSuscripcionEmpresa.count({
      where: { empresaId: companyId },
    }),
    prisma.pagoSuscripcionEmpresa.aggregate({
      where: {
        empresaId: companyId,
        estadoMercadoPago: { in: ["PAID", "AUTHORIZED"] },
      },
      _sum: { monto: true },
    }),
    prisma.pago.count({
      where: {
        usuario: {
          administradorId: { in: adminIds.length ? adminIds : ["__none__"] },
        },
      },
    }),
    prisma.auditLog.findMany({
      where: {
        administradorId: { in: adminIds.length ? adminIds : ["__none__"] },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        details: true,
        createdAt: true,
        administrador: {
          select: {
            nombre: true,
          },
        },
      },
    }),
    prisma.auditLog.count({
      where: {
        administradorId: { in: adminIds.length ? adminIds : ["__none__"] },
      },
    }),
  ]);

  const lastActivity = logs[0]?.createdAt ?? null;
  const baseItem = buildCompanyItem({
    company,
    activeUsersCount: activeUsers,
    lastActivity,
  });

  return {
    company: {
      ...baseItem,
      createdAt: company.fechaCreacion,
      updatedAt: company.fechaActualizacion,
      totalAdmins: company.administradores.length,
      activeAdmins: company.administradores.filter((admin) => admin.estaActivo)
        .length,
      totalUsers,
      totalOperations: totalUserPayments + totalSubscriptionPayments,
      totalSubscriptionRevenue: subscriptionRevenue._sum.monto ?? 0,
    },
    admins: company.administradores.map((admin) => ({
      id: admin.id,
      nombre: admin.nombre,
      email: admin.email,
      rol: admin.rol,
      estaActivo: admin.estaActivo,
      fechaCreacion: admin.fechaCreacion,
    })),
    users: userRows.map((user) => ({
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      estado: user.estado,
      estaActivo: user.estaActivo,
      fechaCreacion: user.fechaCreacion,
      adminNombre: user.administrador.nombre,
    })),
    paymentHistory: subscriptionPayments.map((payment) => ({
      id: payment.id,
      monto: payment.monto,
      estadoMercadoPago: payment.estadoMercadoPago,
      fechaPago: payment.fechaPago,
      mercadoPagoPaymentId: payment.mercadoPagoPaymentId,
    })),
    logs: logs.map((log) => ({
      id: log.id,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      details: log.details,
      createdAt: log.createdAt,
      adminNombre: log.administrador?.nombre ?? null,
    })),
  };
}
