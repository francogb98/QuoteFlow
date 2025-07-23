"use server";

import { auth } from "@/auth.config";
import prisma from "@/lib/prisma";
import type { AdminData, UsuarioWithPagos } from "@/types/usuarios";
import type { Decimal } from "@prisma/client/runtime/library";

export const getUsersList = async (
  filterByMonth = false,
  month?: number,
  year?: number
): Promise<AdminData> => {
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

    // Función para convertir Decimal a number
    const convertDecimalToNumber = (
      value: Decimal | null | undefined
    ): number => {
      return value ? value.toNumber() : 0;
    };

    // Serializar los usuarios y sus pagos con tipos explícitos
    // @ts-ignore
    const serializedUsers: UsuarioWithPagos[] = admin.usuarios.map(
      (usuario) => ({
        ...usuario,
        pagos: usuario.pagos.map((pago) => ({
          ...pago,
          // @ts-ignore
          monto: convertDecimalToNumber(pago.monto),
          fecha: pago.fecha.toISOString(),
        })),
      })
    );

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
