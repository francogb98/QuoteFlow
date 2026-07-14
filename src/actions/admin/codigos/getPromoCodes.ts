"use server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth.config";

export const getPromoCodes = async (): Promise<{
  promoCodes: any;
  ok: boolean;
}> => {
  try {
    const session = await auth();
    if (!session?.user || session.user.rol !== "SUPER_ADMIN") {
      return { promoCodes: [], ok: false };
    }
    const promoCodes = await prisma.codigoPromocional.findMany({
      orderBy: {
        estaActivo: "desc",
      },
    });
    return { promoCodes, ok: true };
  } catch (error) {
    console.error("Error al obtener códigos:", error);
    return { promoCodes: [], ok: false };
  }
};
