// 01-actions/admin/account/deleteAdmin.ts
"use server";
import prisma from "@/lib/prisma";

export async function deleteAdmin(id: string) {
  try {
    // 1. Find the administrator to ensure they exist and are not the main ADMIN.
    const adminToDeactivate = await prisma.administrador.findUnique({
      where: { id },
    });

    if (!adminToDeactivate) {
      return { ok: false, error: "Administrador no encontrado." };
    }

    if (adminToDeactivate.rol === "ADMINISTRADOR") {
      return {
        ok: false,
        error:
          "No se puede eliminar un administrador con rol de ADMINISTRADOR.",
      };
    }

    // 2. Update the 'estaActivo' field to false instead of deleting the record.
    await prisma.administrador.update({
      where: { id },
      data: {
        estaActivo: false,
      },
    });

    return {
      ok: true,
      message: "Administrador eliminado exitosamente.", // Use this message for the UI
    };
  } catch (error) {
    console.error("Error al desactivar el administrador:", error);
    return { ok: false, error: "Error al eliminar el administrador." };
  }
}
