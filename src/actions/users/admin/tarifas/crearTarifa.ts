"use server";

import { auth } from "@/auth.config";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function crearConfiguracionTarifa(data: any) {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new Error("Usuario no autenticado");
    }

    const { tipoConfiguracion, rangos, dinamicas } = data;

    // 1. Create the new tariff configuration
    const nuevaConfiguracion = await prisma.configuracionTarifa.create({
      data: {
        tipoConfiguracion,
        rangos: {
          create: rangos || [],
        },
        dinamicas: {
          create: dinamicas || [],
        },
        administradores: {
          connect: { id: session.user.id },
        },
      },
    });

    revalidatePath(`/admin/settings`);
    revalidatePath(`/admin/users`);
    revalidatePath(`/admin/home`);

    return { ok: true, configuracion: nuevaConfiguracion };
  } catch (error) {
    console.error("Error creating tariff configuration:", error);
    return { ok: false, error: "Error en el servidor, intente nuevamente" };
  }
}
