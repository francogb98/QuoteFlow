import {
  deleteFromCloudinary,
  extractCloudinaryPublicId,
} from "@/lib/images/cloudinary-utils";
import prisma from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      pagoId,
      comprobanteUrl,
      previousComprobanteUrl,
      usuarioId,
      administradorId,
    } = body;

    if (!pagoId || !comprobanteUrl || !administradorId || !usuarioId) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    if (previousComprobanteUrl) {
      console.log(
        "[v0] Attempting to delete previous image:",
        previousComprobanteUrl
      );

      const publicId = extractCloudinaryPublicId(previousComprobanteUrl);
      if (publicId) {
        const deleted = await deleteFromCloudinary(publicId);
        if (deleted) {
          console.log(
            "[v0] Successfully deleted previous image from Cloudinary"
          );
        } else {
          console.warn("[v0] Failed to delete previous image from Cloudinary");
          // No fallar la operación completa si no se puede eliminar la imagen anterior
        }
      } else {
        console.warn("[v0] Could not extract public_id from previous URL");
      }
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
