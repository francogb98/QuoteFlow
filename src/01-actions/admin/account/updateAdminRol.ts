"use server";

import { auth } from "@/auth.config";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { ActionResponse, handleActionError } from "@/lib/utils/action-errors";

const updateRolSchema = z.object({
  targetAdminId: z.string().min(1),
  nuevoRol: z.enum(["ADMINISTRADOR", "PROFESOR", "SUPER_ADMIN"]),
});

/**
 * Assigns a role to a target admin.
 * - Only SUPER_ADMIN can assign or remove the SUPER_ADMIN role.
 * - ADMINISTRADOR can assign PROFESOR role within their own company.
 */
export async function updateAdminRol(
  data: z.infer<typeof updateRolSchema>,
): Promise<ActionResponse<any>> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { ok: false, error: "No autenticado." };
    }

    const callerRol = session.user.rol;
    const { targetAdminId, nuevoRol } = updateRolSchema.parse(data);

    // Only SUPER_ADMIN can grant or revoke SUPER_ADMIN role
    if (nuevoRol === "SUPER_ADMIN" && callerRol !== "SUPER_ADMIN") {
      return {
        ok: false,
        error:
          "Solo un SUPER_ADMIN puede asignar el rol SUPER_ADMIN a otro usuario.",
      };
    }

    // Only SUPER_ADMIN or ADMINISTRADOR can change roles at all
    if (callerRol !== "SUPER_ADMIN" && callerRol !== "ADMINISTRADOR") {
      return {
        ok: false,
        error: "No tienes permiso para modificar roles.",
      };
    }

    const targetAdmin = await prisma.administrador.findUnique({
      where: { id: targetAdminId },
      select: { id: true, rol: true, empresaId: true },
    });

    if (!targetAdmin) {
      return { ok: false, error: "Administrador no encontrado." };
    }

    // ADMINISTRADOR can only modify admins within their own company, and cannot
    // promote to ADMINISTRADOR or demote from ADMINISTRADOR
    if (callerRol === "ADMINISTRADOR") {
      if (targetAdmin.empresaId !== session.user.empresaId) {
        return {
          ok: false,
          error:
            "No puedes modificar roles de administradores de otra empresa.",
        };
      }
      if (targetAdmin.rol === "ADMINISTRADOR" || nuevoRol === "ADMINISTRADOR") {
        return {
          ok: false,
          error:
            "No tienes permiso para asignar o revocar el rol ADMINISTRADOR.",
        };
      }
    }

    const updated = await prisma.administrador.update({
      where: { id: targetAdminId },
      data: { rol: nuevoRol },
      select: { id: true, nombre: true, rol: true },
    });

    return {
      ok: true,
      data: updated,
      message: `Rol actualizado a ${nuevoRol} correctamente.`,
    };
  } catch (error: any) {
    return handleActionError(error, "Error al actualizar el rol");
  }
}
