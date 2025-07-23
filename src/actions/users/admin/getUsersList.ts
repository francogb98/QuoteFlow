"use server";

import { auth } from "@/auth.config";
import prisma from "@/lib/prisma";

export const getUsersList = async (
  filterByMonth = false,
  month: any,
  year: any
) => {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("No estás logueado");
    }

    const { id: adminId } = session.user;

    const currentDate = new Date();
    const currentMonth = month || currentDate.getMonth() + 1;
    const currentYear = year || currentDate.getFullYear();

    const includePayments = filterByMonth
      ? {
          pagos: {
            where: {
              mes: currentMonth,
              año: currentYear,
            },
          },
        }
      : { pagos: true };

    const admin = await prisma.administrador.findUnique({
      where: {
        id: adminId,
      },
      include: {
        usuarios: {
          include: includePayments,
        },
        configuracionTarifa: {
          include: {
            rangos: true,
          },
        },
      },
    });

    if (!admin) {
      return {
        usuarios: [],
        configuracionTarifa: null,
      };
    }

    // Serializar los usuarios y sus pagos (sin conversión de Decimal)
    const serializedUsers = admin.usuarios.map((usuario) => ({
      ...usuario,
      pagos: usuario.pagos.map((pago) => ({
        ...pago,
        // monto y mora ya son números (Float/Int), solo convertimos la fecha
        fecha: pago.fecha.toISOString(),
      })),
    }));

    // Filtrar usuarios si es necesario
    let usersToReturn = serializedUsers;
    if (filterByMonth) {
      usersToReturn = serializedUsers.filter(
        (usuario) => usuario.pagos && usuario.pagos.length > 0
      );
    }

    return {
      usuarios: usersToReturn,
      configuracionTarifa: admin.configuracionTarifa,
    };
  } catch (error) {
    console.error("Error al buscar usuarios:", error);
    throw error;
  }
};
