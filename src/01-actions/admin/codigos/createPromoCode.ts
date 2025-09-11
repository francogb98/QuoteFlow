"use server";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/auth.config";

interface CreatePromoCodeResult {
  promoCode?: any;
  ok: boolean;
  error?: string;
}

const generateRandomCode = () => {
  // Genera un código aleatorio de 8 caracteres
  return uuidv4().substring(0, 8).toUpperCase();
};

export const createPromoCode = async (): Promise<CreatePromoCodeResult> => {
  try {
    const session = await auth();
    // Opcional: validar si el usuario tiene permiso para crear códigos
    if (!session?.user || session.user.rol !== "SUPER_ADMIN") {
      return { ok: false, error: "No autorizado." };
    }

    const newCode = generateRandomCode();

    const promoCode = await prisma.codigoPromocional.create({
      data: {
        codigo: newCode,
        duracionMeses: 2, // Por defecto, 2 meses
        estaActivo: true,
      },
    });

    return {
      promoCode,
      ok: true,
    };
  } catch (error) {
    console.error("Error al crear el código promocional:", error);
    return {
      ok: false,
      error: "No se pudo crear el código promocional. Intente de nuevo.",
    };
  }
};
