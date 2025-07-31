"use server";

import { auth } from "@/auth.config";
import prisma from "@/lib/prisma";
import { TipoConfiguracionTarifa } from "@prisma/client";

export async function getUsersList(
  filterByMonth = false,
  selectedMonth?: number,
  selectedYear?: number
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Usuario no autenticado");
    }

    const administradorId = session.user.id;

    // Obtener configuración de tarifas para determinar el tipo de sistema
    const configuracionTarifa = await prisma.configuracionTarifa.findUnique({
      where: { administradorId },
    });

    const whereClause: any = {
      administradorId,
      estaActivo: true,
    };

    // Si se filtra por mes, ajustar la consulta según el tipo de sistema
    if (filterByMonth && selectedMonth && selectedYear) {
      if (
        configuracionTarifa?.tipoConfiguracion ===
        TipoConfiguracionTarifa.DINAMICA_POR_FECHA_INGRESO
      ) {
        // Para sistema dinámico, filtrar por fechaVencimiento
        const startDate = new Date(selectedYear, selectedMonth - 1, 1);
        const endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);

        whereClause.pagos = {
          some: {
            fechaVencimiento: {
              gte: startDate,
              lte: endDate,
            },
          },
        };
      } else {
        // Para sistema fijo, filtrar por mes y año tradicional
        whereClause.pagos = {
          some: {
            mes: selectedMonth,
            año: selectedYear,
          },
        };
      }
    }

    const usuarios = await prisma.usuario.findMany({
      where: whereClause,
      include: {
        pagos: filterByMonth
          ? configuracionTarifa?.tipoConfiguracion ===
            TipoConfiguracionTarifa.DINAMICA_POR_FECHA_INGRESO
            ? {
                where: {
                  fechaVencimiento: {
                    gte: new Date(selectedYear!, selectedMonth! - 1, 1),
                    lte: new Date(selectedYear!, selectedMonth!, 0, 23, 59, 59),
                  },
                },
                orderBy: { fechaVencimiento: "desc" },
              }
            : {
                where: {
                  mes: selectedMonth,
                  año: selectedYear,
                },
                orderBy: { fecha: "desc" },
              }
          : {
              orderBy: { fecha: "desc" },
              take: 5, // Limitar a los últimos 5 pagos si no se filtra
            },
      },
      orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
    });

    return {
      usuarios,
      tipoConfiguracion: configuracionTarifa?.tipoConfiguracion || null,
      totalUsuarios: usuarios.length,
    };
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    throw new Error("Error al obtener la lista de usuarios");
  }
}
