// src/actions/admin/users/lib/editUser.ts
"use server";

import { auth } from "@/auth";
import prisma from "@/prisma";
import { TipoConfiguracionTarifa, type Estado } from "@prisma/client";
import { revalidatePath } from "next/cache";
import {
  type ActionResponse,
  handleActionError,
} from "@/lib/utils/action-errors";
import { z } from "zod";

const editUserSchema = z.object({
  id: z.string().min(1, "ID de usuario es obligatorio"),
  nombre: z.string().min(1, "El nombre es obligatorio").max(50),
  apellido: z.string().min(1, "El apellido es obligatorio").max(50),
  documento: z.string().min(1, "El documento es obligatorio").max(10),
  telefono: z.string().optional().nullable(),
  estaActivo: z.boolean(),
  estado: z.string().min(1, "El estado es obligatorio"),
  email: z.email("Correo inválido").optional().nullable(),
  edad: z
    .preprocess(
      (val) => Number(val),
      z.number().int().positive("La edad debe ser un número positivo")
    )
    .optional()
    .nullable(),
  tarifa: z.string().optional().nullable(), // For tariff ID
  fechaInicioMembresia: z.preprocess(
    (val) => (val instanceof Date ? val.toISOString().split("T")[0] : val),
    z.string().optional().nullable()
  ),
});

export const editUser = async (
  content: z.infer<typeof editUserSchema>
): Promise<ActionResponse<any>> => {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new Error("No estás logueado");
    }

    const { id } = session.user;

    const validatedContent = editUserSchema.parse(content);

    // Lógica para manejar la fecha en horario de Argentina
    let fechaInicioMembresia: Date | null = null;
    if (validatedContent.fechaInicioMembresia) {
      const [year, month, day] =
        validatedContent.fechaInicioMembresia.split("-");
      // Creamos un objeto Date que represente la medianoche de la fecha en el huso horario de Argentina
      // El "3" en la hora se usa para evitar problemas con los cambios de horario (daylight saving)
      fechaInicioMembresia = new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        3,
        0,
        0
      );
    }

    const dataToEdit = {
      nombre: validatedContent.nombre.toLocaleLowerCase(),
      apellido: validatedContent.apellido.toLowerCase(),
      documento: validatedContent.documento,
      telefono: validatedContent.telefono,
      estaActivo: validatedContent.estaActivo,
      estado: validatedContent.estado as Estado,
      email: validatedContent.email,
      edad: validatedContent.edad,
      fechaInicioMembresia: fechaInicioMembresia, // Usa la fecha ajustada
    };

    // Verificar documento único (excluyendo al usuario actual)
    const existingUser = await prisma.usuario.findFirst({
      where: {
        documento: dataToEdit.documento,
        administradorId: id,
        NOT: {
          id: validatedContent.id,
        },
      },
    });

    if (existingUser) {
      throw new Error("Ya existe un usuario con este documento");
    }

    let tariffUpdateData = {};

    if (validatedContent.tarifa) {
      // Get admin's tariff configuration to validate the selected tariff
      const adminConfig = await prisma.administrador.findUnique({
        where: { id },
        include: {
          configuracionTarifa: {
            include: {
              rangos: true,
              dinamicas: true,
            },
          },
        },
      });

      if (!adminConfig?.configuracionTarifa) {
        throw new Error("No hay configuración de tarifas disponible");
      }

      const configuracionTarifa = adminConfig.configuracionTarifa;
      const isDynamicTariff =
        configuracionTarifa.tipoConfiguracion ===
        TipoConfiguracionTarifa.DINAMICA_POR_FECHA_INGRESO;

      if (isDynamicTariff) {
        // Validate dynamic tariff exists
        const dinamicaExists = configuracionTarifa.dinamicas.find(
          (d) => d.id === validatedContent.tarifa
        );
        if (!dinamicaExists) {
          throw new Error("La configuración dinámica seleccionada no existe");
        }

        tariffUpdateData = {
          dinamicaTarifaId: validatedContent.tarifa,
          rangoTarifaId: null, // Clear the other tariff type
        };
      } else {
        // Validate range tariff exists
        const rangoExists = configuracionTarifa.rangos.find(
          (r) => r.id === validatedContent.tarifa
        );
        if (!rangoExists) {
          throw new Error("El rango de tarifa seleccionado no existe");
        }

        tariffUpdateData = {
          rangoTarifaId: validatedContent.tarifa,
          dinamicaTarifaId: null, // Clear the other tariff type
        };
      }
    }

    const user = await prisma.usuario.update({
      where: {
        id: validatedContent.id,
        administradorId: id,
      },
      data: {
        ...dataToEdit,
        ...tariffUpdateData, // Include tariff updates
      },
    });

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${validatedContent.id}`);

    return {
      success: true,
      data: user,
      message: "Usuario actualizado exitosamente.",
    };
  } catch (error) {
    return handleActionError(error, "Error al editar usuario");
  }
};
