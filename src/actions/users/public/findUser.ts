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

    let usuario = null;
    let adminEncontrado = null;

    // Buscar el usuario en todos los administradores de la empresa
    for (const admin of empresaExist.administradores) {
      const usuarioEncontrado = await prisma.usuario.findFirst({
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

      if (usuarioEncontrado) {
        usuario = usuarioEncontrado;
        adminEncontrado = admin;
        break; // Salir del bucle cuando se encuentra el usuario
      }
    }

    if (!usuario || !adminEncontrado) {
      return {
        ok: false,
        message:
          "No se encontró el usuario en ningún administrador de la empresa.",
      };
    }

    // ✅ SOLO RETORNAR DATOS - Sin actualizaciones

    return {
      ok: true,
      id: usuario.id,
      administradorId: adminEncontrado.id,
      modoDePago: adminEncontrado.modeloDeCobro,
      usuario: usuario,
      configuracionTarifa: adminEncontrado.configuracionTarifa,
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
