import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const adminId = url.searchParams.get("adminId");
    const yearParam = url.searchParams.get("year");
    const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();
    const months = [9, 10, 11, 12];

    const admins = await prisma.administrador.findMany({
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" },
    });

    const usuarios = await prisma.usuario.findMany({
      where: {
        estado: "ACTIVO",
        estaActivo: true,
        ...(adminId ? { administradorId: adminId } : {}),
      },
      select: {
        id: true,
        nombre: true,
        fechaInicioMembresia: true,
        administrador: {
          select: {
            id: true,
            nombre: true,
          },
        },
        pagos: {
          where: {
            mes: { in: months },
            año: year,
          },
          select: {
            id: true,
            mes: true,
            año: true,
            estado: true,
            monto: true,
          },
        },
      },
      orderBy: { nombre: "asc" },
    });

    const usuariosMapped = usuarios.map((u) => {
      const inicio = u.fechaInicioMembresia
        ? u.fechaInicioMembresia.toISOString()
        : null;

      const pagosByMonth: Record<
        string,
        { estado: string; monto: number } | null
      > = {};
      months.forEach((m) => {
        const p = (u.pagos as any[]).find(
          (x) => Number(x.mes) === m && Number(x.año) === year
        );
        pagosByMonth[String(m)] = p
          ? { estado: String(p.estado), monto: Number(p.monto ?? 0) }
          : null;
      });

      return {
        id: u.id,
        nombre: u.nombre,
        administrador: u.administrador
          ? { id: u.administrador.id, nombre: u.administrador.nombre }
          : null,
        inicio,
        pagosByMonth,
      };
    });

    return NextResponse.json({
      ok: true,
      year,
      months,
      admins,
      usuarios: usuariosMapped,
    });
  } catch (err) {
    console.error("[api/admin/users-report] Error:", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
