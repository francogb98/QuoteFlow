"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updatePayment(data: any) {
  try {
    const { paymentId, monto, estado, metodo } = data;

    // Validaciones
    if (!paymentId) {
      return { ok: false, message: "ID de pago requerido" };
    }

    if (monto <= 0) {
      return { ok: false, message: "El monto debe ser mayor a 0" };
    }

    const validStates = ["PAGADO", "PENDIENTE", "VENCIDO"];
    if (!validStates.includes(estado)) {
      return { ok: false, message: "Estado de pago inválido" };
    }

    const validMethods = [
      "EFECTIVO",
      "MERCADOPAGO",
      "TRANSFERENCIA",
      "TARJETA",
    ];
    if (!validMethods.includes(metodo)) {
      return { ok: false, message: "Método de pago inválido" };
    }

    // Actualizar el pago
    const updatedPayment = await prisma.pago.update({
      where: { id: paymentId },
      data: {
        monto: monto,
        estado: estado,
        metodo: metodo,
        estaVencido: estado === "VENCIDO",
      },
    });

    // Revalidar la ruta
    revalidatePath(`/admin/users/${updatedPayment.usuarioId}`);

    return {
      ok: true,
      message: "Pago actualizado correctamente",
      updatedPayment,
    };
  } catch (error) {
    console.error("Error updating payment:", error);
    return {
      ok: false,
      message: "Error al actualizar el pago",
    };
  }
}
