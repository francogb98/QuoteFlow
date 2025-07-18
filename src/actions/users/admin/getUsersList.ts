"use server";

import { auth } from "@/auth.config";
import prisma from "@/lib/prisma";
import type {
  Usuario,
  Pago,
  ConfiguracionTarifa,
  RangoTarifa,
} from "@prisma/client";

// Define un tipo de retorno más específico para la función
type GetUsersListResult = {
  usuarios: (Usuario & { pagos: Pago[] })[];
  configuracionTarifa: (ConfiguracionTarifa & { rangos: RangoTarifa[] }) | null;
  // Agrega cualquier otra propiedad que el administrador pueda tener y necesites
} | null;

export const getUsersList = async (
  filterByMonth = true, // Nuevo parámetro para controlar el filtro
  month?: number, // Mes opcional si filterByMonth es true
  year?: number // Año opcional si filterByMonth es true
): Promise<GetUsersListResult> => {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("No estás logueado");
    }

    const { id: adminId } = session.user;
    const currentDate = new Date();
    const currentMonth = month || currentDate.getMonth() + 1; // Usa el mes proporcionado o el actual
    const currentYear = year || currentDate.getFullYear(); // Usa el año proporcionado o el actual

    const includePayments = filterByMonth
      ? {
          pagos: {
            where: {
              mes: currentMonth,
              año: currentYear,
            },
          },
        }
      : { pagos: true }; // Si no se filtra por mes, incluye todos los pagos

    const admin = await prisma.administrador.findUnique({
      where: {
        id: adminId,
      },
      include: {
        usuarios: {
          include: includePayments, // Usa la configuración de includePayments
        },
        configuracionTarifa: {
          include: {
            rangos: true,
          },
        },
      },
    });

    if (!admin) {
      return null;
    }

    let usersToReturn = admin.usuarios;

    // Si filterByMonth es true, filtra los usuarios que tienen pagos en el mes/año actual
    if (filterByMonth) {
      usersToReturn = admin.usuarios.filter(
        (usuario) => usuario.pagos && usuario.pagos.length > 0
      );
    }

    // No es necesario cambiar la contraseña aquí si ya se maneja en auth.config.ts
    // Si admin.password existe y necesitas ocultarlo, hazlo en el objeto final que retornas
    // const { password, ...restAdmin } = admin; // Ejemplo de desestructuración para omitir password

    return {
      ...admin, // Devuelve el resto de las propiedades del administrador
      usuarios: usersToReturn, // Devuelve los usuarios filtrados o todos
    };
  } catch (error) {
    console.error("Error al buscar usuarios:", error);
    throw error;
  }
};
