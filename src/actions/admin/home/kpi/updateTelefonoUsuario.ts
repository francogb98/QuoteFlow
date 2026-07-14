"use server";

import prisma from "@/lib/prisma";

interface Input {
  usuarioId: string;
  telefono: string;
}

export async function updateTelefonoUsuario({ usuarioId, telefono }: Input) {
  try {
    await prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        telefono,
      },
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "No se pudo actualizar el teléfono" };
  }
}
