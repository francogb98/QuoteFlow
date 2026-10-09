// src/actions/admin/users/lib/editUser.ts
"use server";

import { auth } from "@/auth";
import { TipoConfiguracionTarifa, type Estado } from "@prisma/client";
import { revalidatePath } from "next/cache";
import {
  type ActionResponse,
  handleActionError,
} from "@/lib/utils/action-errors";
import { z } from "zod";
import prisma from "@/lib/prisma";

const editUserSchema = z.object({
  id: z.string().min(1, "ID de usuario es obligatorio"),
  nombre: z.string().min(1, "El nombre es obligatorio").max(50),
  apellido: z.string().min(1, "El apellido es obligatorio").max(50),
  documento: z.preprocess(
    (val) => (typeof val === "string" ? val.trim() : val),
    z.string().min(1, "El documento es obligatorio").max(20)
  ),
  telefono: z.string().optional().nullable(),
  estaActivo: z.boolean().optional().nullable(),
  estado: z.string().min(1, "El estado es obligatorio"),
  email: z.email("Correo inválido").optional().nullable(),
  edad: z
    .preprocess(
      (val) => (val === "" || val == null ? null : Number(val)),
      z
        .number()
        .int()
        .positive("La edad debe ser un número positivo")
        .nullable()
    )
    .optional()
    .nullable(),
  tarifa: z.string().optional().nullable(),
  fechaInicioMembresia: z.preprocess(
    (val) => {
      // Normalize many possible inputs to either "YYYY-MM-DD" or null
      if (val == null) return null;
      if (typeof val === "string") {
        const s = val.trim();
        if (s === "") return null;
        // If value contains time, keep date part
        const datePart = s.includes("T") ? s.split("T")[0] : s;
        return datePart;
      }
      if (val instanceof Date) {
        if (isNaN(val.getTime())) return null;
        return val.toISOString().split("T")[0];
      }
      return null;
    },
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida, espere YYYY-MM-DD")
      .nullable()
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

    // El alcance de lectura/edición es la EMPRESA (igual que getUser): un admin
    // puede editar usuarios de otros admins de su misma empresa.
    const admin = await prisma.administrador.findUnique({
      where: { id },
      select: { empresaId: true },
    });

    if (!admin?.empresaId) {
      throw new Error("Administrador sin empresa asignada");
    }

    const validatedContent = editUserSchema.parse(content);

    // Lógica para manejar la fecha en horario de Argentina
    let fechaInicioMembresia: Date | null = null;
    if (validatedContent.fechaInicioMembresia) {
      const dateStr = validatedContent.fechaInicioMembresia;
      // dateStr tiene formato YYYY-MM-DD garantizado por Zod
      const [year, month, day] = dateStr.split("-").map((s) => Number(s));
      const candidate = new Date(year, month - 1, day, 3, 0, 0);
      if (!isNaN(candidate.getTime())) {
        fechaInicioMembresia = candidate;
      } else {
        // fallback: null en vez de pasar Invalid Date a Prisma
        fechaInicioMembresia = null;
      }
    }

    const dataToEdit = {
      nombre: validatedContent.nombre.toLocaleLowerCase(),
      apellido: validatedContent.apellido.toLowerCase(),
      documento: validatedContent.documento,
      telefono: validatedContent.telefono,
      // "estado" es la única fuente de verdad para habilitar/inhabilitar:
      // se deriva "estaActivo" para que ambos campos no se desincronicen.
      estaActivo: validatedContent.estado === "ACTIVO",
      estado: validatedContent.estado as Estado,
      email: validatedContent.email,
      edad: validatedContent.edad,
      fechaInicioMembresia: fechaInicioMembresia ?? null,
    };

    // Verificar documento único dentro de la empresa (excluyendo al usuario actual)
    const existingUser = await prisma.usuario.findFirst({
      where: {
        documento: dataToEdit.documento,
        administrador: { empresaId: admin.empresaId },
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
          nombreTarifaAsignada: dinamicaExists.nombre,
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
          nombreTarifaAsignada: rangoExists.nombre,
        };
      }
    }

    const userToUpdate = await prisma.usuario.findFirst({
      where: {
        id: validatedContent.id,
        administrador: { empresaId: admin.empresaId },
      },
      select: { id: true },
    });

    if (!userToUpdate) {
      throw new Error("Usuario no encontrado");
    }

    const user = await prisma.usuario.update({
      where: {
        id: validatedContent.id,
      },
      data: {
        ...dataToEdit,
        ...tariffUpdateData,
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
    if (error instanceof z.ZodError) {
      throw new Error(error.issues[0]?.message ?? "Datos inválidos");
    }
    const response = handleActionError(error, "Error al editar usuario");
    // Relanzar para que el cliente (React Query) trate el caso como error
    // real y no muestre un falso "Usuario actualizado correctamente".
    throw new Error(response.error || "Error al editar usuario");
  }
};
