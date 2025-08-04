"use server";
import { auth } from "@/auth.config";
import prisma from "@/lib/prisma";
import type { Empresa } from "@prisma/client";

interface SubscriptionInfoResult {
  empresa?: Empresa;
  ok: boolean;
  error?: string;
}

export const getSubscriptionInfo =
  async (): Promise<SubscriptionInfoResult> => {
    try {
      const session = await auth();
      const adminId = session?.user?.id;

      if (!adminId) {
        return { ok: false, error: "No autorizado." };
      }

      // Buscamos la empresa a través del administrador logueado
      const empresa = await prisma.empresa.findFirst({
        where: {
          administradores: {
            some: {
              id: adminId,
            },
          },
        },
        // Seleccionamos solo la información relevante para evitar pasar datos innecesarios
        select: {
          id: true,
          nombre: true,
          planTipo: true,
          frecuenciaPago: true,
          estadoPago: true,
          estaActiva: true,
          esCuentaPrueba: true,
          fechaFinPrueba: true,
          fechaProximoVencimiento: true,
        },
      });

      if (!empresa) {
        return {
          ok: false,
          error: "No se encontró información de la empresa.",
        };
      }

      return {
        //@ts-ignore
        empresa,
        ok: true,
      };
    } catch (error) {
      console.error("Error al obtener información de suscripción:", error);
      return { ok: false, error: "Ocurrió un error al cargar la suscripción." };
    }
  };
