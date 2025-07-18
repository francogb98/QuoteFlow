"use server";
import prisma from "@/lib/prisma";

export const getAdmin = async (userId: string) => {
  if (!userId) {
    return null;
  }
  try {
    const admin = await prisma.administrador.findUnique({
      where: {
        id: userId,
      },
      include: {
        empresa: true, // NUEVO: Incluir la relación de empresa
        configuracionTarifa: {
          include: {
            rangos: true,
          },
        },
      },
    });

    if (!admin) {
      return null;
    }

    // Ocultar la contraseña antes de devolver el objeto
    const { password: _, ...adminWithoutPassword } = admin;

    return adminWithoutPassword;
  } catch (error) {
    console.error("Error al buscar administrador:", error);
    throw error; // Es importante lanzar el error para que React Query lo maneje
  }
};
