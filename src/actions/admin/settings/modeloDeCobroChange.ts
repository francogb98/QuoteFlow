"use server";

import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function actualizarModeloCobro(
  modeloCobro: "MERCADOPAGO" | "COMPROBANTE"
) {
  try {
    const user = await requireAuth();

    // Validar que el modelo de cobro sea válido
    if (!["MERCADOPAGO", "COMPROBANTE"].includes(modeloCobro)) {
      return {
        success: false,
        error: "Modelo de cobro inválido",
      };
    }

    await prisma.$transaction(async (tx) => {
      // Actualizar el modelo de cobro del administrador
      await tx.administrador.update({
        where: { id: user.id },
        data: {
          modeloDeCobro: modeloCobro,
        },
      });

      // Crear log de auditoría
      await tx.auditLog.create({
        data: {
          action: "MODELO_COBRO_ACTUALIZADO",
          entityType: "ADMINISTRADOR",
          entityId: user.id,
          details: `Modelo de cobro cambiado a ${modeloCobro}`,
          administradorId: user.id,
        },
      });
    });

    // Revalidar las rutas que podrían mostrar esta información
    revalidatePath("/admin/settings");
    revalidatePath("/dashboard");
    revalidatePath("/admin/configuracion");

    return {
      success: true,
      message: `Modelo de cobro actualizado a ${modeloCobro}`,
    };
  } catch (error) {
    console.error("Error al actualizar modelo de cobro:", error);
    return {
      success: false,
      error: "Error al actualizar el modelo de cobro",
    };
  }
}

export async function obtenerModeloCobroActual() {
  try {
    const user = await requireAuth();

    const administrador = await prisma.administrador.findUnique({
      where: { id: user.id },
      select: {
        modeloDeCobro: true,
      },
    });

    if (!administrador) {
      return {
        success: false,
        error: "No se encontró el administrador",
      };
    }

    return {
      success: true,
      modeloCobro: administrador.modeloDeCobro,
    };
  } catch (error) {
    console.error("Error al obtener modelo de cobro:", error);
    return {
      success: false,
      error: "Error al cargar el modelo de cobro",
    };
  }
}
