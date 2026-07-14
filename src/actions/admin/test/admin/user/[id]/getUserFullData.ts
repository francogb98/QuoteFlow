"use server";
import prisma from "@/lib/prisma";

export async function getUserFullData(id: string) {
  try {
    if (!id) {
      return { ok: false, error: "missing id" };
    }

    const user = await prisma.usuario.findUnique({
      where: { id },
      include: {
        administrador: {
          include: {
            configuracionTarifa: {
              include: {
                rangos: true,
                dinamicas: true,
              },
            },
          },
        },
        pagos: {
          orderBy: { fecha: "desc" },
        },
        rangoTarifa: true,
        dinamicaTarifa: true,
      },
    });

    if (!user) {
      return { ok: false, error: "Usuario no encontrado" };
    }

    return { ok: true, user };
  } catch (err) {
    console.error("[getUserFullData] Error:", err);
    return { ok: false, error: String(err) };
  }
}
