"use server";
import prisma from "@/lib/prisma";

export async function saveUserEmail({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) {
  try {
    const updatedUser = await prisma.usuario.update({
      where: { id: userId },
      data: {
        email: email,
      },
    });

    return { ok: true, usuario: updatedUser };
  } catch (error) {
    console.error("Error al guardar el email del usuario:", error);
    return {
      ok: false,
      error: "Error al guardar el email. Por favor, intente nuevamente.",
    };
  }
}
