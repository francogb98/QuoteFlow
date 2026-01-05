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
    59
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
      orderBy: { fechaVencimiento: "asc" },
      take: 10,
      include: {
        usuario: {
          select: { nombre: true, apellido: true, documento: true },
        },
      },
    }),

    // ÚLTIMOS PAGOS CONFIRMADOS
    prisma.pago.findMany({
      where: {
        usuario: { administradorId: adminId },
        estado: "PAGADO",
        fechaVencimiento: { gte: startOfMonth, lte: endOfMonth },
      },
      orderBy: { fechaVencimiento: "desc" },
      take: 10,
      include: {
        usuario: {
          select: { nombre: true, apellido: true, documento: true },
        },
      },
    }),
  ]);

  // === AGREGADOS DE AGREGACIÓN ===

  const totalFacturadoMes = pagosEmitidosMes.reduce(
    (acc: any, p: any) => acc + p.monto,
    0
  );

  const pagosRecibidosMes = pagosEmitidosMes.reduce(
    (acc: any, p: any) => (p.estado === "PAGADO" ? acc + p.monto : acc),
    0
  );

  const pagosVencidosMes = pagosEmitidosMes.reduce(
    (acc: any, p: any) => (p.estado === "VENCIDO" ? acc + p.monto : acc),
    0
  );

  const montoPendiente = pagosPendVenc.reduce(
    (acc: any, p: any) => acc + p.monto,
    0
  );

  const conteoPageVencidos = pagosPendVenc.filter(
    (p: any) => p.estado === "VENCIDO"
  ).length;

  const conteoPageAprobados = pagosEmitidosMes.length;

  const conteoPagesPendientes = pagosPendVenc.filter(
    (p: any) => p.estado === "PENDIENTE"
  ).length;

  return {
    kpis: {
      usuariosNuevosMes,
      totalUsuariosActivos,
      pagosRecibidosMes,
      totalFacturadoMes,
      pagosVencidosMes,
      montoPendiente,
      conteoPageVencidos,
      conteoPagesPendientes,
      conteoPagePagados,
      conteoPageAprobados,
    },
    proximosVencimientos,
    ultimosPagos,
  };
}
