"use server";

import { auth } from "@/auth.config";
import prisma from "@/lib/prisma";
import type { AdminData, UsuarioWithPagos } from "@/types/usuarios";

export const getUsersList = async (
  filterByMonth = false,
  month?: number,
  year?: number
): Promise<AdminData> => {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("No estás logueado");

    const { id: adminId } = session.user;
    const currentDate = new Date();
    const currentMonth = month || currentDate.getMonth() + 1;
    const currentYear = year || currentDate.getFullYear();

    const admin = await prisma.administrador.findUnique({
      where: { id: adminId },
      include: {
        usuarios: {
          include: {
            pagos: filterByMonth
              ? {
                  where: {
                    mes: currentMonth,
                    año: currentYear,
                  },
                  take: 1, // Solo trae 1 pago (el del mes)
                }
              : false, // Si no es filtrado por mes, no trae pagos
          },
        },
        configuracionTarifa: { include: { rangos: true } },
      },
    });

    if (!admin) return { usuarios: [], configuracionTarifa: null };

    if (!filterByMonth) {
      return {
        // @ts-expect-error
        usuarios: admin.usuarios,
        configuracionTarifa: admin.configuracionTarifa,
      };
    }

    // Serialización simplificada
    const serializedUsers: UsuarioWithPagos[] = admin.usuarios.map(
      (usuario) => ({
        ...usuario,
        pagos: usuario.pagos.map((pago) => ({
          ...pago,
          monto: pago.monto,
          fecha: pago.fecha.toISOString(),
        })),
      })
    );

    // Filtrado (opcional, si quieres excluir usuarios sin pagos en el mes)
    const usersToReturn = filterByMonth
      ? serializedUsers.filter((usuario) => usuario.pagos.length > 0)
      : serializedUsers;

    return {
      usuarios: usersToReturn,
      configuracionTarifa: admin.configuracionTarifa,
    };
  } catch (error) {
    console.error("Error al buscar usuarios:", error);
    throw error;
  }
};
