"use server";

import { auth } from "@/*";
import prisma from "@/lib/prisma";
import { UsuarioWithPagos } from "@/types/usuarios";

export const getUser = async (id: string): Promise<UsuarioWithPagos> => {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new Error("No estás logueado");
    }

    const { id: adminId } = session.user;

    const user = await prisma.usuario.findUniqueOrThrow({
      where: {
        id: id,
        administradorId: adminId,
      },
      include: {
        pagos: {
          orderBy: {
            fecha: "desc",
          },
        },
      },
    });
    return user;
  } catch (error) {
    console.error("Error al buscar usuario:", error);
    throw error; // Es importante lanzar el error para que React Query lo maneje
  }
};
