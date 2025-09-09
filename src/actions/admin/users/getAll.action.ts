"use server";
import { auth } from "@/auth.config";
import prisma from "@/lib/prisma";

export const getUsersList = async (
  profesorId: string | undefined | null,
  selectedMonth: number,
  selectedYear: number
) => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("Usuario no autenticado");
  }

  try {
    const admin = await prisma.administrador.findUnique({
      where: { id: userId },
      select: {
        empresaId: true,
        rol: true,
        configuracionTarifa: true,
      },
    });

    if (!admin?.empresaId) {
      throw new Error("Empresa no encontrada");
    }

    let whereClause: any = {};
    if (profesorId) {
      whereClause = { administradorId: profesorId };
    } else {
      whereClause = { administradorId: userId };
    }
    let pagosWhere: any = {};
    const filterByMonth =
      selectedMonth !== undefined && selectedYear !== undefined;

    // 🔹 Sistema fijo mensual → usar mes y año o periodo
    pagosWhere.mes = selectedMonth;
    pagosWhere.año = selectedYear;

    const [usuarios, totalUsuarios] = await prisma.$transaction([
      prisma.usuario.findMany({
        where: {
          administradorId: profesorId || userId,
          ...(filterByMonth && { pagos: { some: pagosWhere } }),
        },
        include: {
          pagos: {
            where: pagosWhere,
            orderBy: { fechaVencimiento: "asc" },
          },
        },
        orderBy: { nombre: "asc" },
      }),
      prisma.usuario.count({
        where: {
          administradorId: profesorId || userId,
          ...(filterByMonth && { pagos: { some: pagosWhere } }),
        },
      }),
    ]);

    return {
      usuarios,
      totalUsuarios,
      tipoConfiguracion: admin.configuracionTarifa?.tipoConfiguracion || null,
    };
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    throw new Error("No se pudo obtener la lista de usuarios");
  }
};
