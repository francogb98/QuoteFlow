"use server";
import prisma from "@/lib/prisma";
import type { FindUserResult } from "@/types/find-user-result";

export const findUser = async (
  documento: string,
  empresa: string
): Promise<FindUserResult> => {
  console.log("findUser", documento, empresa);
  try {
    // Buscar empresa con sus datos nuevos
    const empresaExist = await prisma.empresa.findUnique({
      where: { nombre: empresa },
      include: {
        administradores: {
          where: { estaActivo: true }, // Opcional: solo activos
          include: {
            configuracionTarifa: {
              include: {
                rangos: true,
              },
            },
          },
        },
      },
    });

    if (!empresaExist || empresaExist.administradores.length === 0) {
      return {
        ok: false,
        message:
          "No se encontró la empresa o no tiene administradores activos.",
      };
    }

    const admin = empresaExist.administradores[0]; // Asumimos el primero (si usás múltiples, deberías cambiar esta lógica)

    const usuario = await prisma.usuario.findFirst({
      where: {
        documento,
        administradorId: admin.id,
      },
      include: {
        pagos: {
          orderBy: { fecha: "desc" },
        },
      },
    });

    if (!usuario) {
      return {
        ok: false,
        message: "No se encontró el usuario.",
      };
    }

    return {
      ok: true,
      id: usuario.id,
      administradorId: admin.id,
      usuario,
      configuracionTarifa: admin.configuracionTarifa,
      empresa: {
        id: empresaExist.id,
        nombre: empresaExist.nombre,
        planTipo: empresaExist.planTipo,
        estadoPago: empresaExist.estadoPago,
        frecuenciaPago: empresaExist.frecuenciaPago,
        fechaUltimoPago: empresaExist.fechaUltimoPago,
        fechaProximoVencimiento: empresaExist.fechaProximoVencimiento,
        estaActiva: empresaExist.estaActiva,
      },
    };
  } catch (error) {
    console.error("Error al buscar usuario:", error);
    return {
      ok: false,
      message: "Error al buscar usuario.",
    };
  }
};
