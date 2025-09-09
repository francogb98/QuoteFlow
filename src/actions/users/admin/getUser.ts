"use server";

import { auth } from "@/auth.config";
import prisma from "@/lib/prisma";

export async function getUser(userId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Usuario no autenticado");
    }

    const administradorId = session.user.id;

    // Obtener el usuario con sus pagos
    const user = await prisma.usuario.findFirst({
      where: {
        id: userId,
        administradorId,
      },
      include: {
        pagos: {
          orderBy: [
            { año: "desc" },
            { mes: "desc" },
            { fechaVencimiento: "desc" },
          ],
        },
        dinamicaTarifa: true,
        rangoTarifa: true,
        notificaciones: true,
      },
    });

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Obtener configuración de tarifas del administrador
    const configuracionTarifa = await prisma.configuracionTarifa.findFirst({
      where: { administradores: { some: { id: administradorId } } },
      include: { rangos: true },
    });

    return {
      ...user,
      configuracionTarifa,
    };
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    throw new Error("Error al obtener la información del usuario");
  }
}
