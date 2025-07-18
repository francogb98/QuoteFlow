"use server";

import { auth } from "@/*";
import prisma from "@/prisma";

export const editUser = async (content: any) => {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new Error("No estás logueado"); // Lanza error en lugar de return
    }

    const { id } = session.user;

    const dataToEdit = {
      nombre: content.nombre.toLocaleLowerCase(),
      apellido: content.apellido.toLowerCase(),
      documento: content.documento,
      telefono: content.telefono,
      estaActivo: content.estaActivo,
      estado: content.estado,
      edad: content.edad ? +content.edad : undefined,
    };

    // Verificar documento único (excluyendo al usuario actual)
    const existingUser = await prisma.usuario.findFirst({
      where: {
        documento: dataToEdit.documento,
        administradorId: id,
        NOT: {
          id: content.id, // Excluir al usuario actual
        },
      },
    });

    if (existingUser) {
      throw new Error("Ya existe un usuario con este documento");
    }

    const user = await prisma.usuario.update({
      where: {
        id: content.id,
        administradorId: id,
      },
      data: dataToEdit,
    });

    return user; // Devuelve directamente el usuario
  } catch (error) {
    console.error("Error en editUser:", error);
    throw error; // Esto es crucial para que useMutation capture el error
  }
};
