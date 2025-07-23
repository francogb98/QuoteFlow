"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { $Enums } from "@prisma/client";

interface CreatePaymentData {
  usuarioId: string;
  monto: number;
  estado: $Enums.EstadoPago;
  metodo: string;
  mes: number;
  año: number;
}

interface CreatePaymentResult {
  ok: boolean;
  message?: string;
  createdPayment?: any;
}

const validMethods = [
  "EFECTIVO",
  "MERCADOPAGO",
  "TRANSFERENCIA",
  "TARJETA",
] as const;

export async function createPayment(
  data: CreatePaymentData
): Promise<CreatePaymentResult> {
  try {
    const { usuarioId, monto, estado, metodo, mes, año } = data;

    // Validaciones básicas
    if (!usuarioId) {
      return { ok: false, message: "ID de usuario requerido" };
    }

    if (monto <= 0) {
      return { ok: false, message: "El monto debe ser mayor a 0" };
    }

    if (mes < 1 || mes > 12) {
      return { ok: false, message: "El mes debe estar entre 1 y 12" };
    }

    if (año < 2020 || año > 2030) {
      return { ok: false, message: "El año debe estar entre 2020 y 2030" };
    }

    const validStates = Object.values($Enums.EstadoPago);
    if (!validStates.includes(estado)) {
      return { ok: false, message: "Estado de pago inválido" };
    }

    if (!validMethods.includes(metodo as any)) {
      return { ok: false, message: "Método de pago inválido" };
    }

    // Verificar que el usuario existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      return { ok: false, message: "Usuario no encontrado" };
    }

    // Verificar que no existe un pago para el mismo mes y año
    const existingPayment = await prisma.pago.findFirst({
      where: {
        usuarioId: usuarioId,
        mes: mes,
        año: año,
      },
    });

    if (existingPayment) {
      return {
        ok: false,
        message: `Ya existe un pago para ${mes}/${año}. No se pueden crear pagos duplicados para el mismo período.`,
      };
    }

    // Crear la fecha del pago (primer día del mes)
    const fechaPago = new Date(año, mes - 1, 1);

    // Crear el pago
    const createdPayment = await prisma.pago.create({
      data: {
        usuarioId: usuarioId,
        monto: monto,
        estado: estado,
        // @ts-ignore
        metodo: metodo,
        mes: mes,
        año: año,
        fecha: fechaPago,
        periodo: `${mes.toString().padStart(2, "0")}/${año}`, // Formato: "08/2025"
        estaVencido: estado === $Enums.EstadoPago.VENCIDO,
      },
    });

    // Revalidar las rutas relevantes
    revalidatePath(`/admin/users/${usuarioId}`);
    revalidatePath("/admin/users/list");

    return {
      ok: true,
      message: `Pago creado correctamente para ${mes}/${año}`,
      createdPayment,
    };
  } catch (error) {
    console.error("Error creating payment:", error);
    return {
      ok: false,
      message: "Error interno del servidor al crear el pago",
    };
  }
}
