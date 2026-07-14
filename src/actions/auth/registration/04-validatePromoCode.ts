"use server";

import prisma from "@/lib/prisma";

interface ValidatePromoCodeResult {
  success: boolean;
  message?: string;
  error?: string;
  codigoData?: {
    id: string;
    duracionMeses: number;
  };
}

export async function validatePromoCode(
  codigo: string
): Promise<ValidatePromoCodeResult> {
  try {
    if (!codigo || codigo.trim() === "") {
      return {
        success: false,
        error: "El código promocional es requerido",
      };
    }

    const codigoPromocional = await prisma.codigoPromocional.findUnique({
      where: { codigo: codigo.toUpperCase().trim() },
    });

    if (!codigoPromocional) {
      return {
        success: false,
        error: "Código promocional no válido",
      };
    }

    if (!codigoPromocional.estaActivo) {
      return {
        success: false,
        error: "Este código promocional ya no está activo",
      };
    }

    // Verificar si el código ha expirado
    if (
      codigoPromocional.fechaExpiracion &&
      new Date() > codigoPromocional.fechaExpiracion
    ) {
      return {
        success: false,
        error: "Este código promocional ha expirado",
      };
    }

    return {
      success: true,
      message: `Código válido: ${codigoPromocional.duracionMeses} meses de prueba`,
      codigoData: {
        id: codigoPromocional.id,
        duracionMeses: codigoPromocional.duracionMeses,
      },
    };
  } catch (error: any) {
    console.error("Error validando código promocional:", error);
    return {
      success: false,
      error: "Error al validar el código promocional",
    };
  }
}
