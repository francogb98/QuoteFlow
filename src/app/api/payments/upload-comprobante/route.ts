import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { pagoId, comprobanteUrl, administradorId, usuarioId } =
      await request.json();

    console.log("Received data:", {
      pagoId,
      comprobanteUrl,
      administradorId,
      usuarioId,
    });
    if (!pagoId || !comprobanteUrl || !administradorId || !usuarioId) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    const updatedPago = await prisma.pago.update({
      where: { id: pagoId },
      data: {
        comprobante: comprobanteUrl,
        // Optionally update status to indicate comprobante was uploaded
        estado: "PENDIENTE", // Keep as pending until admin approves
      },
      include: {
        usuario: true,
      },
    });

    await prisma.notificacion.create({
      data: {
        tipo: "COMPROBANTE_SUBIDO",
        titulo: "Nuevo Comprobante Subido",
        mensaje: `${updatedPago.usuario.nombre} ${updatedPago.usuario.apellido} (DNI: ${updatedPago.usuario.documento}) ha subido un comprobante de pago para el período ${updatedPago.mes}/${updatedPago.año} por un monto de $${updatedPago.monto}.`,
        administradorId: administradorId,
        entidadTipo: "COMPROBANTE",
        entidadId: pagoId,
        usuarioId: usuarioId,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "UPLOAD_COMPROBANTE",
        entityType: "PAYMENT",
        entityId: pagoId,
        details: `Comprobante subido por usuario ${usuarioId}`,
        administradorId: administradorId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Comprobante subido exitosamente",
    });
  } catch (error) {
    console.error("Error uploading comprobante:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
