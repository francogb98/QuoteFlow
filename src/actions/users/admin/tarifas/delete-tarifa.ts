"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface Result {
  ok: boolean;
  error?: string;
}

export async function eliminarTarifa(
  id: string,
  tipo: "FIJA_MENSUAL" | "DINAMICA_POR_FECHA_INGRESO"
): Promise<Result> {
  try {
    if (tipo === "FIJA_MENSUAL") {
      await prisma.rangoTarifa.delete({
        where: { id },
      });
    } else if (tipo === "DINAMICA_POR_FECHA_INGRESO") {
      await prisma.configuracionDinamicaTarifa.delete({
        where: { id },
      });
    }

    // Revalidar la ruta para actualizar los datos en la UI
    revalidatePath("/admin/tarifas");

    return { ok: true };
  } catch (error) {
    console.error("Error al eliminar la tarifa:", error);
    return { ok: false, error: "No se pudo eliminar la tarifa." };
  }
}
