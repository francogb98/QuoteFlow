import { auth } from "@/auth.config";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const MONTHS = [9, 10, 11, 12]; // Fijos para tu frontend

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const year = Number(searchParams.get("year"));

    // Solo SUPER_ADMIN puede consultar datos de otro admin vía query param.
    // El resto forzosamente ve sus propios datos.
    const isSuperAdmin = session.user.rol === "SUPER_ADMIN";
    const adminId = isSuperAdmin
      ? (searchParams.get("adminId") ?? session.user.id)
      : session.user.id;

    if (!year) {
      return NextResponse.json(
        { error: "Parámetro 'year' es requerido" },
        { status: 400 },
      );
    }

    // Traer admins para el selector (solo SUPER_ADMIN puede ver todos)
    const admins = isSuperAdmin
      ? await prisma.administrador.findMany({
          select: { id: true, nombre: true },
          orderBy: { nombre: "asc" },
        })
      : await prisma.administrador.findMany({
          where: { id: session.user.id },
          select: { id: true, nombre: true },
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
      { status: 500 },
    );
  }
}
