"use server";

import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function getUsuariosConTokens() {
  try {
    const user = await requireAuth();

    // Obtener usuarios de la empresa del administrador con tokens FCM registrados
    const usuariosConTokens = await prisma.usuario.findMany({
      where: {
        administrador: {
          empresaId: user.empresaId,
        },
        //@ts-ignore
        fcmTokens: {
          some: {}, // Solo usuarios que tienen al menos un token
        },
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        documento: true,
        //@ts-ignore
        fcmTokens: {
          select: {
            id: true,
            token: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        nombre: "asc",
      },
    });

    return { success: true, usuarios: usuariosConTokens };
  } catch (error) {
    console.error("Error al obtener usuarios con tokens:", error);
    return {
      success: false,
      usuarios: [],
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}
