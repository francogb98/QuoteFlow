"use server";
import { auth } from "@/*";
import prisma from "@/lib/prisma";
import { sendPaymentStatusEmail } from "../emails/sendPaymentStatusEmail";
import { revalidatePath } from "next/cache";

export async function editPayment({ pagoId, newStatus, rejectionReason }: any) {
  try {
    const session = await auth();
    if (!session) {
      return { ok: false, error: "No autorizado" };
    }

    // 1. Encontrar el pago y el usuario asociado antes de la actualización
    const pago = await prisma.pago.findUnique({
      where: { id: pagoId },
      include: {
        usuario: true,
      },
    });

    if (!pago || !pago.usuario) {
      return { ok: false, error: "Pago o usuario no encontrado" };
    }

    // 2. Actualizar el pago en la base de datos
    const updatedPayment = await prisma.pago.update({
      where: { id: pagoId },
      data: {
        estado: newStatus,
        motivo: rejectionReason,
      },
    });

    // 3. Enviar el correo electrónico
    const emailResponse = await sendPaymentStatusEmail({
      nombre: pago.usuario.nombre,
      apellido: pago.usuario.apellido,
      empresa: session.user.empresa.nombre,
      documento: pago.usuario.documento,
      to: pago.usuario.email!,
      newStatus: updatedPayment.estado,
      motivo: updatedPayment.motivo,
    });

    if (!emailResponse.success) {
      console.error(
        "Error al enviar el correo electrónico:",
        emailResponse.error,
      );
    }

    revalidatePath(`/admin/pagos/${pagoId}`);

    return { ok: true, pago: updatedPayment };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "Error en el servidor al editar el pago." };
  }
}
