"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { Rol } from "@prisma/client";

interface ToggleAdminStatusResult {
  ok: boolean;
  message?: string;
  error?: string;
}

export async function toggleAdminStatus(
  adminId: string,
  newStatus: boolean
): Promise<ToggleAdminStatusResult> {
  const session = await auth();

  // Verificar que el usuario esté autenticado y sea un ADMINISTRADOR
  if (!session?.user || session.user.rol !== Rol.ADMINISTRADOR) {
    return {
      ok: false,
      error:
        "Acceso denegado. Solo administradores principales pueden modificar el estado.",
    };
  }

  const empresaId = session.user.empresa?.id;

  if (!empresaId) {
    return {
      ok: false,
      error: "No se pudo determinar la empresa del administrador actual.",
    };
  }

  // No permitir que un administrador se desactive a sí mismo
  if (session.user.id === adminId) {
    return {
      ok: false,
      error: "No puedes cambiar tu propio estado de actividad.",
    };
  }

  try {
    // Verificar que el administrador a modificar pertenezca a la misma empresa
    const adminToUpdate = await prisma.administrador.findUnique({
      where: { id: adminId },
      select: { empresaId: true },
    });

    if (!adminToUpdate || adminToUpdate.empresaId !== empresaId) {
      return {
        ok: false,
        error: "Administrador no encontrado o no pertenece a tu empresa.",
      };
    }

    await prisma.administrador.update({
      where: { id: adminId },
      data: { estaActivo: newStatus },
    });

    return {
      ok: true,
      message: `Estado del administrador actualizado a ${
        newStatus ? "activo" : "inactivo"
      }.`,
    };
  } catch (error: any) {
    console.error("Error al cambiar estado del administrador:", error);
    return {
      ok: false,
      error: error.message || "Error desconocido al actualizar el estado.",
    };
  }
}
