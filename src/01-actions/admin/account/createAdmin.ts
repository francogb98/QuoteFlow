// 01-actions/admin/account/createAdmin.ts
"use server";
import { auth } from "@/auth.config";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";
import { z } from "zod";
import { ActionResponse, handleActionError } from "@/lib/utils/action-errors";

// Define a Zod schema for creating an admin
const createAdminSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(25),
  email: z.string().email("Correo inválido"),
  documento: z.string().min(1, "El documento es obligatorio").max(10),
  telefono: z.string().min(1, "El teléfono es obligatorio").max(15),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(25, "La contraseña debe tener como máximo 25 caracteres"),
  permitirModificarTarifa: z.boolean().optional(),
  permitirModificarCobro: z.boolean().optional(),
});

export const createAdmin = async (
  data: z.infer<typeof createAdminSchema>
): Promise<ActionResponse<any>> => {
  try {
    const session = await auth();

    if (!session?.user || session.user.rol !== "ADMINISTRADOR") {
      return {
        ok: false,
        error: "No tienes permiso para realizar esta acción",
      };
    }

    const validatedData = createAdminSchema.parse(data);

    // Retrieve the current administrator's settings
    const currentAdmin = await prisma.administrador.findUnique({
      where: { id: session.user.id },
      select: {
        configuracionTarifaId: true,
        modeloDeCobro: true,
      },
    });

    if (!currentAdmin) {
      return {
        ok: false,
        error: "No se encontró el administrador actual.",
      };
    }

    const hashedPassword = await hash(validatedData.password, 10);

    const newAdminData: any = {
      ...validatedData,
      password: hashedPassword,
      empresaId: session.user.empresaId,
      rol: "PROFESOR",
      permitirModificarTarifa: validatedData.permitirModificarTarifa ?? true,
      permitirModificarCobro: validatedData.permitirModificarCobro ?? true,
    };

    // Si no puede modificar tarifas → hereda la misma configuracion
    if (!newAdminData.permitirModificarTarifa) {
      if (!currentAdmin.configuracionTarifaId) {
        return {
          ok: false,
          error:
            "El administrador principal no tiene una configuración de tarifa definida.",
        };
      }
      newAdminData.configuracionTarifaId = currentAdmin.configuracionTarifaId;
    }

    // Si no puede modificar cobro → hereda modeloDeCobro
    if (!newAdminData.permitirModificarCobro) {
      newAdminData.modeloDeCobro = currentAdmin.modeloDeCobro;
    }

    const admin = await prisma.administrador.create({
      data: newAdminData,
    });

    return {
      ok: true,
      data: admin,
      message: "Administrador creado exitosamente.",
    };
  } catch (error: any) {
    return handleActionError(error, "Error al crear administrador");
  }
};
