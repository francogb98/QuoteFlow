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

    // Obtener el empresaId del administrador actual
    const admin = await prisma.administrador.findUnique({
      where: { id: administradorId },
      select: { empresaId: true },
    });

    if (!admin?.empresaId) {
      throw new Error("Administrador sin empresa asignada");
    }

    // Obtener el usuario - permite acceso a usuarios de cualquier admin de la misma empresa
    const user = await prisma.usuario.findFirst({
      where: {
        id: userId,
        administrador: {
          empresaId: admin.empresaId,
        },
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
