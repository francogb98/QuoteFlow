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

export async function createPayment(data: CreatePaymentData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Usuario no autenticado");
    }

    const administradorId = session.user.id;

    // Verificar que el usuario pertenece al administrador
    const user = await prisma.usuario.findFirst({
      where: {
        id: data.usuarioId,
        administradorId,
      },
    });

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Obtener configuración de tarifas
    const configuracionTarifa = await prisma.configuracionTarifa.findUnique({
      where: { administradorId },
      include: { rangos: true },
    });

    if (!configuracionTarifa) {
      throw new Error("No hay configuración de tarifas");
    }

    const isDynamicTariff =
      configuracionTarifa.tipoConfiguracion ===
      TipoConfiguracionTarifa.DINAMICA_POR_FECHA_INGRESO;

    // Verificar si ya existe un pago para el período
    let existingPayment;
    if (isDynamicTariff && data.fechaVencimiento) {
      // Para sistema dinámico, verificar por fecha de vencimiento
      const startOfMonth = new Date(
        data.fechaVencimiento.getFullYear(),
        data.fechaVencimiento.getMonth(),
        1
      );
      const endOfMonth = new Date(
        data.fechaVencimiento.getFullYear(),
        data.fechaVencimiento.getMonth() + 1,
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
      // Para sistema fijo, verificar por mes/año
      existingPayment = await prisma.pago.findFirst({
        where: {
          usuarioId: data.usuarioId,
          mes: data.mes,
          año: data.año,
        },
      });
    }

    if (existingPayment) {
      throw new Error("Ya existe un pago para este período");
    }

    // Crear el pago según el tipo de sistema
    const paymentData: any = {
      usuarioId: data.usuarioId,
      monto: data.monto,
      estado: data.estado,
      metodo: data.metodo,
      fecha: new Date(),
      estaVencido: data.estado === $Enums.EstadoPago.VENCIDO,
    };

    if (isDynamicTariff) {
      // Sistema dinámico: usar fecha de vencimiento específica
      if (!data.fechaVencimiento) {
        throw new Error("Fecha de vencimiento requerida para sistema dinámico");
      }

      paymentData.fechaVencimiento = data.fechaVencimiento;
      paymentData.mes = data.fechaVencimiento.getMonth() + 1;
      paymentData.año = data.fechaVencimiento.getFullYear();
      paymentData.periodo = `${data.fechaVencimiento.getFullYear()}-${String(
        data.fechaVencimiento.getMonth() + 1
      ).padStart(2, "0")}`;
    } else {
      // Sistema fijo: usar mes/año tradicional
      if (!data.mes || !data.año) {
        throw new Error("Mes y año requeridos para sistema fijo");
      }

      paymentData.mes = data.mes;
      paymentData.año = data.año;
      paymentData.periodo = `${data.año}-${String(data.mes).padStart(2, "0")}`;
      paymentData.fechaVencimiento = null;
    }

    const newPayment = await prisma.pago.create({
      data: paymentData,
    });

    revalidatePath(`/admin/users/${data.usuarioId}`);
    revalidatePath("/admin/users/list");

    return {
      ok: true,
      message: "Pago creado exitosamente",
      pago: newPayment,
    };
  } catch (error) {
    console.error("Error al crear pago:", error);
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Error al crear el pago",
    };
  }
}
