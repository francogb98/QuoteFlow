// 01-actions/admin/account/editAdmin.ts
"use server";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { ActionResponse, handleActionError } from "@/lib/utils/action-errors";

const editAdminSchema = z.object({
  id: z.string(),
  nombre: z.string().min(1, "El nombre es obligatorio").max(25),
  email: z.string().email("Correo inválido"),
  documento: z.string().min(1, "El documento es obligatorio").max(10),
  telefono: z.string().min(1, "El teléfono es obligatorio").max(15),
  password: z
    .string()
    .optional()
    .refine(
      (val) => !val || (val.length >= 6 && val.length <= 25),
      "La contraseña debe tener entre 6 y 25 caracteres"
    ),
  repeatPassword: z
    .string()
    .optional()
    .refine(
      (val) => !val || (val.length >= 6 && val.length <= 25),
      "La contraseña debe tener entre 6 y 25 caracteres"
    ),
  permitirModificarTarifa: z.boolean().optional(),
  permitirModificarCobro: z.boolean().optional(),
});

export async function editAdmin(
  formData: z.infer<typeof editAdminSchema>
): Promise<ActionResponse<any>> {
  try {
    const validatedData = editAdminSchema.parse(formData);
    const { id, password, ...rest } = validatedData;

    // Buscar el admin por id
    const currentAdmin = await prisma.administrador.findUnique({
      where: { id },
      include: { empresa: true },
    });

    if (!currentAdmin) {
      return { ok: false, error: "Administrador no encontrado." };
    }

    const updateData: any = {};

    // Comparar y actualizar campos
    if (rest.nombre !== currentAdmin.nombre) updateData.nombre = rest.nombre;
    if (rest.email !== currentAdmin.email) {
      const existEmail = await prisma.administrador.findUnique({
        where: { email: rest.email },
      });
      if (existEmail && existEmail.id !== id) {
        return { ok: false, error: "El email ya existe para otro usuario." };
      }
      updateData.email = rest.email;
    }
    if (rest.documento !== currentAdmin.documento) {
      const existDoc = await prisma.administrador.findUnique({
        where: { documento: rest.documento },
      });
      if (existDoc && existDoc.id !== id) {
        return {
          ok: false,
          error: "El documento ya existe para otro usuario.",
        };
      }
      updateData.documento = rest.documento;
    }
    if (rest.telefono !== currentAdmin.telefono)
      updateData.telefono = rest.telefono;

    // Actualizar contraseña solo si se envía
    if (password) {
      const hashedPassword = await hash(password, 10);
      updateData.password = hashedPassword;
    }

    // Si no hay cambios
    if (Object.keys(updateData).length === 0) {
      return {
        ok: true,
        data: currentAdmin,
        message: "No se detectaron cambios para actualizar.",
      };
    }

    if (rest.permitirModificarTarifa !== currentAdmin.permitirModificarTarifa) {
      updateData.permitirModificarTarifa = rest.permitirModificarTarifa;
    }

    if (rest.permitirModificarCobro !== currentAdmin.permitirModificarCobro) {
      updateData.permitirModificarCobro = rest.permitirModificarCobro;
    }

    const updatedAdmin = await prisma.administrador.update({
      where: { id },
      data: updateData,
      include: { empresa: true },
    });

    revalidatePath(`/admin/settings`);

    return {
      ok: true,
      data: updatedAdmin,
      message: "Administrador actualizado exitosamente.",
    };
  } catch (error: any) {
    return handleActionError(error, "Error al editar el administrador");
  }
}
