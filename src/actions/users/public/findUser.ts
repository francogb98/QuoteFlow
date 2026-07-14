"use server";

import prisma from "@/lib/prisma";
import type { FindUserResult } from "@/types/find-user-result";

export const findUser = async (
  documento: string,
  empresa: string
): Promise<FindUserResult> => {
  try {
    // Buscar empresa
    const empresaExist = await prisma.empresa.findUnique({
      where: { nombre: empresa },
      include: {
        administradores: {
          where: { estaActivo: true },
          select: {
            id: true,
            modeloDeCobro: true,
            configuracionTarifa: {
              include: { rangos: true },
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

    const adminIds = empresaExist.administradores.map((a) => a.id);

    // Single query with OR to find user across all admins (eliminates N+1)
    const usuario = await prisma.usuario.findFirst({
      where: {
        documento,
        administradorId: { in: adminIds },
      },
      include: {
        pagos: { orderBy: { fecha: "desc" } },
      },
    });

    if (!usuario) {
      return {
        ok: false,
        message:
          "No se encontró el usuario en ningún administrador de la empresa.",
      };
    }

    const adminEncontrado = empresaExist.administradores.find(
      (a) => a.id === usuario.administradorId
    );

    // SOLO RETORNAR DATOS - Sin actualizaciones
    return {
      ok: true,
      id: usuario.id,
      administradorId: adminEncontrado!.id,
      modoDePago: adminEncontrado!.modeloDeCobro,
      usuario: usuario,
      configuracionTarifa: adminEncontrado!.configuracionTarifa,
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
