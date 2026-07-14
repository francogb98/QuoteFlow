"use server";
import { auth } from "@/*";
import prisma from "@/lib/prisma";

export async function getPagos(filterByEstado: any) {
  try {
    const session = await auth();
    if (!session) {
      return { ok: false, error: "No autorizado" };
    }

    const adminUsers = await prisma.administrador.findUnique({
      where: { id: session.user.id },
      include: {
        usuarios: {
          include: {
            pagos: {
              where: filterByEstado ? { estado: filterByEstado } : {},
              select: {
                id: true,
                monto: true,
                fecha: true,
                estado: true,
                comprobante: true,
                mes: true,
                motivo: true,
              },
            },
          },
        },
      },
    });

    if (!adminUsers) {
      return {
        ok: false,
        error: "No se registran usuarios con pagos realizados",
      };
    }

    return { ok: true, adminUsers };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "error en el servidor intente nuevamente" };
  }
}
