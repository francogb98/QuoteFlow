"use server";
import { auth } from "@/*";
import prisma from "@/lib/prisma";

export const getNameTarifas = async () => {
  try {
    const session = await auth();

    if (!session) {
      return {
        ok: false,
        error: "No estás autenticado",
      };
    }

    // 👇 ahora buscamos al admin con su configuracionTarifa
    const admin = await prisma.administrador.findUnique({
      where: { id: session.user.id },
      include: {
        configuracionTarifa: {
          include: {
            dinamicas: true,
            rangos: true,
          },
        },
      },
    });

    if (!admin?.configuracionTarifa) {
      return {
        ok: false,
        error: "No se encontró la tarifa",
      };
    }

    console.log(admin.configuracionTarifa);

    return { ok: true, nombreTarifa: admin.configuracionTarifa };
  } catch (error) {
    console.log(error);
    return {
      ok: false,
      error,
    };
  }
};
