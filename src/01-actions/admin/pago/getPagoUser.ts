"use server";
import prisma from "@/prisma";

export async function getPagoUser(pago: string) {
  try {
    if (!pago || typeof pago !== "string") {
      return { success: false, error: "ID de pago inválido." };
    }
    const isPagoExist = await prisma.pago.findUnique({
      where: { id: pago },
      include: {
        usuario: true,
      },
    });

    if (!isPagoExist) {
      return { success: false, error: "Pago no encontrado" };
    }

    return { ok: true, pago: isPagoExist };
  } catch (error) {
    console.log(error);
    return { ok: false, error: "error en el servidor" };
  }
}
