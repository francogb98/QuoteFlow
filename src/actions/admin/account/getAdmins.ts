"use server";

import { auth } from "@/*";
import prisma from "@/lib/prisma";

export const getAdmins = async () => {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        ok: false,
        error: "No estás autenticado",
      };
    }

    const empresa = await prisma.empresa.findUnique({
      where: {
        id: session.user.empresaId,
      },
      include: {
        administradores: {
          where: {
            estaActivo: true,
          },
          include: {
            usuarios: true,
            configuracionTarifa: true,
          },
        },
      },
    });

    if (!empresa) {
      return {
        ok: false,
        error: "Empresa no encontrada",
      };
    }

    return {
      ok: true,
      empresa,
    };
  } catch (error) {
    return {
      ok: false,
      error: "Error en el servidor",
    };
  }
};
