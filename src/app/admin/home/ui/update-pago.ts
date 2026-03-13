"use server";

import prisma from "@/lib/prisma";
import { EstadoPago, MetodoPago } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updatePago(
  pagoId: string,
  data: {
    estado?: EstadoPago;
    metodo?: MetodoPago;
  },
) {
  await prisma.pago.update({
    where: { id: pagoId },
    data: {
      estado: data.estado,
      metodo: data.metodo,
      estaVencido: data.estado === "VENCIDO",
    },
  });

  revalidatePath("/admin/home");
}
