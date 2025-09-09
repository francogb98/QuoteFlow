"use server";

import { revalidate } from "@/app/admin/settings/page";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function obtenerNotificacionesNoLeidas() {
  try {
    const user = await requireAuth();

    const count = await prisma.notificacion.count({
      where: {
        administradorId: user.id,
        leida: false,
      },
    });

    return { success: true, count };
  } catch (error) {
    console.error("Error al obtener notificaciones no leídas:", error);
    return { success: false, count: 0 };
  }
}

export async function obtenerNotificaciones(page = 1, limit = 20) {
  try {
    const user = await requireAuth();
    const skip = (page - 1) * limit;

    const [notificaciones, total] = await Promise.all([
      prisma.notificacion.findMany({
        where: {
          administradorId: user.id,
        },
        orderBy: {
          fechaCreacion: "desc",
        },
        skip,
        take: limit,
        include: {
          remitente: {
            select: {
              nombre: true,
              email: true,
            },
          },
        },
      }),
      prisma.notificacion.count({
        where: {
          administradorId: user.id,
        },
      }),
    ]);

    return {
      success: true,
      notificaciones,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    return { success: false, notificaciones: [], pagination: null };
  }
}

export async function marcarNotificacionComoLeida(id: string) {
  try {
    const user = await requireAuth();

    await prisma.notificacion.update({
      where: {
        id,
        administradorId: user.id,
      },
      data: {
        leida: true,
        fechaLeida: new Date(),
      },
    });

    revalidatePath("/admin/notificaciones");
    revalidatePath("/admin/notificaciones/" + id);
    return { success: true };
  } catch (error) {
    console.error("Error al marcar notificación como leída:", error);
    return { success: false, error: "Error al actualizar notificación" };
  }
}

export async function marcarTodasComoLeidas() {
  try {
    const user = await requireAuth();

    await prisma.notificacion.updateMany({
      where: {
        administradorId: user.id,
        leida: false,
      },
      data: {
        leida: true,
        fechaLeida: new Date(),
      },
    });

    revalidatePath("/admin/notificaciones");
    return { success: true };
  } catch (error) {
    console.error(
      "Error al marcar todas las notificaciones como leídas:",
      error
    );
    return { success: false, error: "Error al actualizar notificaciones" };
  }
}

export async function eliminarNotificacion(id: string) {
  try {
    const user = await requireAuth();

    await prisma.notificacion.delete({
      where: {
        id,
        administradorId: user.id,
      },
    });

    revalidatePath("/admin/notificaciones");
    revalidatePath("/admin/notificaciones/" + id);
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar notificación:", error);
    return { success: false, error: "Error al eliminar notificación" };
  }
}

//funcion para obtener una notificacion por id
export async function obtenerNotificacionPorId(id: string) {
  try {
    const user = await requireAuth();

    const notificacion = await prisma.notificacion.findUnique({
      where: {
        id,
        administradorId: user.id,
      },
      include: {
        remitente: {
          select: {
            nombre: true,
            email: true,
          },
        },
      },
    });

    if (!notificacion) {
      return { success: false, error: "Notificación no encontrada" };
    }

    return { success: true, notificacion };
  } catch (error) {
    console.error("Error al obtener notificación por ID:", error);
    return { success: false, error: "Error al obtener notificación" };
  }
}
