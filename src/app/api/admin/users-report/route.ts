import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const MONTHS = [9, 10, 11, 12]; // Fijos para tu frontend

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const year = Number(searchParams.get("year"));
    const adminId = searchParams.get("adminId") || undefined;

    if (!year) {
      return NextResponse.json(
        { error: "Parámetro 'year' es requerido" },
        { status: 400 }
      );
    }

    // Traer admins para el selector
    const admins = await prisma.administrador.findMany({
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" },
    });

    // Traer configuración de tarifa COMPLETA
    const tarifa = adminId
      ? await prisma.configuracionTarifa.findFirst({
          where: {
            administradores: {
              some: { id: adminId },
            },
            estaActiva: true,
          },
          include: {
            dinamicas: true,
            rangos: true,
          },
        })
      : null;

    // Traer usuarios (filtrados por admin si aplica)
    const usuarios = await prisma.usuario.findMany({
      where: {
        ...(adminId ? { administradorId: adminId } : {}),
      },
      include: {
        administrador: { select: { id: true, nombre: true } },
        pagos: {
          where: { año: year, mes: { in: MONTHS } },
        },
      },
      orderBy: { nombre: "asc" },
    });

    // Mapear a estructura para frontend
    const mapped = usuarios.map((u) => {
      const pagosByMonth = {} as Record<
        string,
        { estado: string; monto: number } | null
      >;

      MONTHS.forEach((m) => {
        const pago = u.pagos.find((p) => p.mes === m) || null;
        pagosByMonth[String(m)] = pago
          ? {
              estado: pago.estado,
              monto: pago.monto,
            }
          : null;
      });

      return {
        id: u.id,
        nombre: `${u.nombre} ${u.apellido ?? ""}`.trim(),
        administrador: u.administrador,
        inicio: u.fechaInicioMembresia,
        pagosByMonth,
      };
    });

    return NextResponse.json({
      admins,
      usuarios: mapped,
      tarifa, // ← Incluye FIXA / DINAMICA / RANGOS
    });
  } catch (err) {
    console.error("Error en users-report:", err);
    return NextResponse.json(
      { error: "Error al generar el reporte" },
      { status: 500 }
    );
  }
}
