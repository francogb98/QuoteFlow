"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { $Enums } from "@prisma/client"; // Importa el enum EstadoPago desde Prisma

interface UpdatePaymentStatusResult {
  ok: boolean;
  message?: string;
  updatedPayment?: any; // Considerar un tipo más específico si es necesario
}

export async function updatePaymentStatus(
  paymentId: string,
  newStatus: $Enums.EstadoPago
): Promise<UpdatePaymentStatusResult> {
  try {
    if (!Object.values($Enums.EstadoPago).includes(newStatus)) {
      return { ok: false, message: "Estado de pago inválido." };
    }

    const updatedPayment = await prisma.pago.update({
      where: { id: paymentId },
      data: {
        estado: newStatus,
        // Opcional: Si 'estaVencido' se gestiona manualmente y no es un campo calculado
        // podrías actualizarlo aquí según el nuevo estado.
        // Por ejemplo, si el estado es VENCIDO, estaVencido = true.
        // Si el estado es PAGADO o PENDIENTE, estaVencido = false.

        estaVencido: newStatus === $Enums.EstadoPago.VENCIDO,
      },
    });

    // Revalida la ruta para asegurar que los datos se refresquen en el cliente
    // ajusta esta ruta según la estructura de tu aplicación si es diferente
    revalidatePath(`/admin/users/${updatedPayment.usuarioId}`);

    return {
      ok: true,
      message: "Estado del pago actualizado correctamente.",
      updatedPayment,
    };
  } catch (error) {
    console.error("Error updating payment status:", error);
    return {
      ok: false,
      message: "Error al actualizar el estado del pago.",
    };
  }
}
