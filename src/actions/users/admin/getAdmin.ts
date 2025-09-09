"use server";

import prisma from "@/lib/prisma";

export async function getAdmin(id: string) {
  try {
    const admin = await prisma.administrador.findUnique({
      where: { id },
      include: {
        empresa: true,
        usuarios: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            documento: true,
            estado: true,
            estaActivo: true,
          },
        },
        configuracionTarifa: {
          include: {
            rangos: true,
            dinamicas: true,
          },
        },
        // NUEVO: Incluir notificaciones recientes
        notificacionesRecibidas: {
          where: {
            leida: false,
          },
          take: 5,
          orderBy: {
            fechaCreacion: "desc",
          },
        },
      },
    });

    if (!admin) {
      return null;
    }

    // No retornar la contraseña
    const { password, ...adminSinPassword } = admin;

    return adminSinPassword;
  } catch (error) {
    console.error("Error al obtener administrador:", error);
    return null;
  }
}
