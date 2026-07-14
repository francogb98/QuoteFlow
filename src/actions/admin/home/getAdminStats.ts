"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function getAdminStats(date?: Date) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const adminId = session.user.id;

  const now = date ? new Date(date) : new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
  );

  const [
    usuariosNuevosMes,
    totalUsuariosActivos,
    pagosEmitidosMes,
    pagosPendVenc,
    conteoPagePagados,
    proximosVencimientos,
    ultimosPagos,
  ] = await Promise.all([
    // NUEVOS DEL MES
    prisma.usuario.count({
      where: {
        administradorId: adminId,
        fechaCreacion: { gte: startOfMonth, lte: endOfMonth },
      },
    }),

    // ACTIVOS TOTALES
    prisma.usuario.count({
      where: { administradorId: adminId, estaActivo: true },
    }),

    // PAGOS EMITIDOS EN EL MES
    prisma.pago.findMany({
      where: {
        usuario: { administradorId: adminId },
        fechaVencimiento: { gte: startOfMonth, lte: endOfMonth },
      },
      select: { monto: true, estado: true },
    }),

    // PAGOS PENDIENTES Y VENCIDOS ACTUALES
    prisma.pago.findMany({
      where: {
        usuario: { administradorId: adminId },
        estado: { in: ["PENDIENTE", "VENCIDO"] },
        fechaVencimiento: { gte: startOfMonth, lte: endOfMonth },
      },
      select: { monto: true, estado: true },
    }),

    // CANT. PAGADOS EN EL MES
    prisma.pago.count({
      where: {
        usuario: { administradorId: adminId },
        estado: "PAGADO",
        fechaVencimiento: { gte: startOfMonth, lte: endOfMonth },
      },
    }),

    // PROXIMOS VENCIMIENTOS
    prisma.pago.findMany({
      where: {
        usuario: { administradorId: adminId },
        estado: "PENDIENTE",
        fechaVencimiento: { gte: startOfMonth, lte: endOfMonth },
      },
      select: {
        id: true,
        monto: true,
        periodo: true,
        fechaVencimiento: true,
        estado: true,
        usuario: {
          select: { nombre: true, apellido: true, documento: true },
        },
      },
      orderBy: { fechaVencimiento: "asc" },
      take: 10,
    }),

    // ÚLTIMOS PAGOS CONFIRMADOS
    prisma.pago.findMany({
      where: {
        usuario: { administradorId: adminId },
        estado: "PAGADO",
        fecha: { gte: startOfMonth, lte: endOfMonth },
      },
      select: {
        id: true,
        monto: true,
        fecha: true,
        estado: true,
        usuario: {
          select: { nombre: true, apellido: true, documento: true },
        },
      },
      orderBy: { fecha: "desc" },
      take: 10,
    }),
  ]);

  // === AGREGADOS DE AGREGACIÓN ===

  const totalFacturadoMes = pagosEmitidosMes.reduce(
    (acc: any, p: any) => acc + p.monto,
    0,
  );

  const pagosRecibidosMes = pagosEmitidosMes.reduce(
    (acc: any, p: any) => (p.estado === "PAGADO" ? acc + p.monto : acc),
    0,
  );

  const pagosVencidosMes = pagosEmitidosMes.reduce(
    (acc: any, p: any) => (p.estado === "VENCIDO" ? acc + p.monto : acc),
    0,
  );

  const montoPendiente = pagosPendVenc.reduce(
    (acc: any, p: any) => acc + p.monto,
    0,
  );

  const conteoPageVencidos = pagosPendVenc.filter(
    (p: any) => p.estado === "VENCIDO",
  ).length;

  const conteoPageAprobados = pagosEmitidosMes.length;

  const conteoPagesPendientes = pagosPendVenc.filter(
    (p: any) => p.estado === "PENDIENTE",
  ).length;

  return {
    kpis: [
      { titulo: "Usuarios Nuevos", valor: usuariosNuevosMes },
      { titulo: "Usuarios Activos", valor: totalUsuariosActivos },
      { titulo: "Ingresos Mes", valor: pagosRecibidosMes },
      { titulo: "Total Facturado", valor: totalFacturadoMes },
      { titulo: "Pagos Vencidos", valor: pagosVencidosMes },
      { titulo: "Monto Pendiente", valor: montoPendiente },
    ],
    // Trend data for charts: last 6 months
    monthlyTrends: await (async () => {
      const trends: any[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

        const pagosMes = await prisma.pago.findMany({
          where: {
            usuario: { administradorId: adminId },
            fechaVencimiento: { gte: start, lte: end },
          },
          select: { monto: true, estado: true },
        });

        const ingresos = pagosMes.reduce(
          (acc: any, p: any) => acc + (p.estado === "PAGADO" ? p.monto : 0),
          0,
        );
        const pagados = pagosMes.filter(
          (p: any) => p.estado === "PAGADO",
        ).length;
        const pendientes = pagosMes.filter(
          (p: any) => p.estado === "PENDIENTE",
        ).length;
        const vencidos = pagosMes.filter(
          (p: any) => p.estado === "VENCIDO",
        ).length;

        trends.push({
          mes: start.toLocaleString("es-AR", { month: "short" }),
          ingresos,
          pagados,
          pendientes,
          vencidos,
        });
      }
      return trends;
    })(),
    proximosVencimientos: proximosVencimientos.map((p) => ({
      ...p,
      fechaVencimiento:
        p.fechaVencimiento?.toISOString() || new Date().toISOString(),
      usuario: {
        nombre: p.usuario.nombre,
        apellido: p.usuario.apellido || "",
        documento: p.usuario.documento,
      },
    })),
    ultimosPagos: ultimosPagos.map((p) => ({
      ...p,
      fecha: p.fecha?.toISOString() || new Date().toISOString(),
      usuario: {
        nombre: p.usuario.nombre,
        apellido: p.usuario.apellido || "",
        documento: p.usuario.documento,
      },
    })),
  };
}
