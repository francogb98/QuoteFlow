"use server";

import { auth } from "@/*";
import prisma from "@/lib/prisma";

/**
 * Obtiene todos los datos globales del admin para inicializar el store
 * Se debe ejecutar después del login para llenar el store con Zustand
 */
export async function getAppData() {
  try {
    const session = await auth();

    if (!session) {
      return {
        ok: false,
        error: "No estás autenticado",
      };
    }

    // Obtener admin con toda su información
    const admin = await prisma.administrador.findUnique({
      where: { id: session.user.id },
      include: {
        configuracionTarifa: {
          include: {
            dinamicas: true,
            rangos: true,
          },
        },
        empresa: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    if (!admin) {
      return {
        ok: false,
        error: "Admin no encontrado",
      };
    }

    return {
      ok: true,
      data: {
        admin: {
          id: admin.id,
          nombre: admin.nombre,
          email: admin.email,
          rol: admin.rol,
          empresa: admin.empresa,
        },
        tarifa: admin.configuracionTarifa || null,
      },
    };
  } catch (error) {
    console.error("Error al obtener datos de la app:", error);
    return {
      ok: false,
      error: "Error al cargar los datos",
    };
  }
}
