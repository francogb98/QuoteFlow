"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface CambiarTarifaParams {
  usuarioId: string;
  rangoTarifaId: string | null;
  nombreTarifa: string | null;
  aplicarAlPagoPendiente?: boolean;
}

export async function cambiarTarifaUsuario(params: CambiarTarifaParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "No autenticado" };
  }

  const { usuarioId, rangoTarifaId, nombreTarifa, aplicarAlPagoPendiente } =
    params;

  const usuario = await prisma.usuario.findFirst({
    where: {
      id: usuarioId,
      administradorId: session.user.id,
    },
  });

  if (!usuario) {
    return { ok: false, message: "Usuario no encontrado" };
  }

  if (rangoTarifaId) {
    const rango = await prisma.rangoTarifa.findFirst({
      where: {
        id: rangoTarifaId,
        configuracionTarifa: {
          administradores: { some: { id: session.user.id } },
        },
      },
    });

    if (!rango) {
      return { ok: false, message: "Tarifa no encontrada" };
    }
  }

  const now = new Date();
  const mesActual = now.getMonth() + 1;
  const añoActual = now.getFullYear();

  await prisma.$transaction(async (tx) => {
    await tx.usuario.update({
      where: { id: usuarioId },
      data: {
        rangoTarifaId,
        nombreTarifaAsignada: nombreTarifa,
      },
    });

    if (aplicarAlPagoPendiente && rangoTarifaId) {
      const rango = await tx.rangoTarifa.findUnique({
        where: { id: rangoTarifaId },
      });

      if (rango) {
        await tx.pago.updateMany({
          where: {
            usuarioId,
            mes: mesActual,
            año: añoActual,
            estado: { in: ["PENDIENTE", "VENCIDO"] },
          },
          data: {
            monto: rango.monto,
          },
        });
      }
    }
  });

  revalidatePath("/admin/home");
  revalidatePath("/admin/users");

  return { ok: true, message: "Tarifa actualizada correctamente" };
}