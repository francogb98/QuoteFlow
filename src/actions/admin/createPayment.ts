"use server";

import { auth } from "@/auth.config";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { TipoConfiguracionTarifa, $Enums } from "@prisma/client";

interface CreatePaymentData {
  usuarioId: string;
  monto: number;
  estado: $Enums.EstadoPago;
  metodo: string;
  mes?: number;
  año?: number;
  fechaVencimiento?: Date;
}

function createArgentinaDate(date: Date): Date {
  // Convert to Argentina timezone (UTC-3)
  const argentinaOffset = -3 * 60; // -3 hours in minutes
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const argentinaTime = new Date(utc + argentinaOffset * 60000);

  // Create a new date at noon in Argentina timezone to avoid day shifts
  return new Date(
    argentinaTime.getFullYear(),
    argentinaTime.getMonth(),
    argentinaTime.getDate(),
    12,
    0,
    0
  );
}

export async function createPayment(data: CreatePaymentData) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Usuario no autenticado");

    const administradorId = session.user.id;

    // Verificar que el usuario pertenece al administrador
    const user = await prisma.usuario.findFirst({
      where: {
        id: data.usuarioId,
        administradorId,
      },
    });
    if (!user) throw new Error("Usuario no encontrado");

    // Buscar configuración de tarifas del administrador
    const configuracionTarifa = await prisma.configuracionTarifa.findFirst({
      where: {
        administradores: { some: { id: administradorId } },
        estaActiva: true,
      },
      include: {
        rangos: true,
        dinamicas: true,
        administradores: true,
      },
    });
    if (!configuracionTarifa)
      throw new Error("No hay configuración de tarifas");

    const isDynamicTariff =
      configuracionTarifa.tipoConfiguracion ===
      TipoConfiguracionTarifa.DINAMICA_POR_FECHA_INGRESO;

    let processedFechaVencimiento: Date | undefined;
    if (data.fechaVencimiento) {
      processedFechaVencimiento = createArgentinaDate(data.fechaVencimiento);
    }

    // Verificar si ya existe un pago para el período
    let existingPayment;
    if (isDynamicTariff && processedFechaVencimiento) {
      const startOfMonth = new Date(
        processedFechaVencimiento.getFullYear(),
        processedFechaVencimiento.getMonth(),
        1
      );
      const endOfMonth = new Date(
        processedFechaVencimiento.getFullYear(),
        processedFechaVencimiento.getMonth() + 1,
        0,
        23,
        59,
        59
      );

      existingPayment = await prisma.pago.findFirst({
        where: {
          usuarioId: data.usuarioId,
          fechaVencimiento: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });
    } else if (data.mes && data.año) {
      existingPayment = await prisma.pago.findFirst({
        where: {
          usuarioId: data.usuarioId,
          mes: data.mes,
          año: data.año,
        },
      });
    }
    if (existingPayment) throw new Error("Ya existe un pago para este período");

    // Crear el pago
    const paymentData: any = {
      usuarioId: data.usuarioId,
      monto: data.monto,
      estado: data.estado,
      metodo: data.metodo,
      fecha: new Date(),
      estaVencido: data.estado === $Enums.EstadoPago.VENCIDO,
    };

    if (isDynamicTariff) {
      if (!processedFechaVencimiento)
        throw new Error("Fecha de vencimiento requerida para sistema dinámico");

      paymentData.fechaVencimiento = processedFechaVencimiento;
      paymentData.mes = processedFechaVencimiento.getMonth() + 1;
      paymentData.año = processedFechaVencimiento.getFullYear();
      paymentData.periodo = `${processedFechaVencimiento.getFullYear()}-${String(processedFechaVencimiento.getMonth() + 1).padStart(2, "0")}`;
    } else {
      if (!data.mes || !data.año)
        throw new Error("Mes y año requeridos para sistema fijo");

      paymentData.mes = data.mes;
      paymentData.año = data.año;
      paymentData.periodo = `${data.año}-${String(data.mes).padStart(2, "0")}`;
      paymentData.fechaVencimiento = null;
    }

    const newPayment = await prisma.pago.create({ data: paymentData });

    revalidatePath(`/admin/users/${data.usuarioId}`);
    revalidatePath("/admin/users/list");

    return { ok: true, message: "Pago creado exitosamente", pago: newPayment };
  } catch (error) {
    console.error("Error al crear pago:", error);
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Error al crear el pago",
    };
  }
}
