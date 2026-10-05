"use server";

import { auth } from "@/auth.config";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";
import { z } from "zod";
import { ActionResponse, handleActionError } from "@/lib/utils/action-errors";

const changePasswordSchema = z.object({
  adminId: z.string().min(1, "ID de administrador requerido"),
  newPassword: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(25, "La contraseña debe tener como máximo 25 caracteres"),
});

export const changeAdminPassword = async (
  data: z.infer<typeof changePasswordSchema>,
): Promise<ActionResponse<null>> => {
  try {
    const session = await auth();

    if (!session?.user || session.user.rol !== "SUPER_ADMIN") {
      return {
        ok: false,
        error: "No tienes permiso para realizar esta acción",
      };
    }

    const validatedData = changePasswordSchema.parse(data);

    const admin = await prisma.administrador.findUnique({
      where: { id: validatedData.adminId },
      select: { id: true, nombre: true, email: true },
    });

    if (!admin) {
      return {
        ok: false,
        error: "No se encontró el administrador.",
      };
    }

    const hashedPassword = await hash(validatedData.newPassword, 10);

    await prisma.administrador.update({
      where: { id: validatedData.adminId },
      data: { password: hashedPassword },
    });

    await prisma.auditLog.create({
      data: {
        action: "CHANGE_PASSWORD",
        entityType: "Administrador",
        entityId: validatedData.adminId,
        details: `Contraseña cambiada por super admin para ${admin.nombre} (${admin.email})`,
        administradorId: session.user.id,
      },
    });

    return {
      ok: true,
      data: null,
      message: `Contraseña actualizada exitosamente para ${admin.nombre}.`,
    };
  } catch (error: any) {
    return handleActionError(error, "Error al cambiar contraseña");
  }
};