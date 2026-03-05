"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

/**
 * Extender suscripción por 1 mes
 * Actualiza fechaFinPeriodoActual a 1 mes después de la fecha actual
 */
export async function extendSubscriptionOneMonth(empresaId: string) {
  try {
    const ahora = new Date();
    const nuevaFechaFin = new Date(ahora);
    nuevaFechaFin.setMonth(nuevaFechaFin.getMonth() + 1);

    // Actualizar la suscripción
    const suscripcion = await prisma.suscripcionEmpresa.findUnique({
      where: { empresaId },
    });

    if (!suscripcion) {
      throw new Error("Suscripción no encontrada");
    }

    // Actualizar fechaFinPeriodoActual y estado a ACTIVA
    await prisma.suscripcionEmpresa.update({
      where: { empresaId },
      data: {
        fechaFinPeriodoActual: nuevaFechaFin,
        estadoSuscripcion: "ACTIVA",
      },
    });

    // Actualizar fechaUltimoPago y fechaProximoVencimiento en Empresa
    await prisma.empresa.update({
      where: { id: empresaId },
      data: {
        fechaUltimoPago: ahora,
        fechaProximoVencimiento: nuevaFechaFin,
        estadoPago: "ACTIVO",
      },
    });

    revalidatePath("/admin/suscripcion-tecnica");
    return { success: true, message: "Suscripción extendida por 1 mes" };
  } catch (error) {
    console.error("Error extendiendo suscripción:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Error al extender suscripción",
    };
  }
}

/**
 * Obtener datos de suscripción de una empresa
 */
export async function getSubscriptionData(empresaId: string) {
  try {
    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
      include: {
        suscripcion: {
          include: {
            pagoSuscripcionEmpresas: {
              orderBy: { fechaPago: "desc" },
              take: 10,
            },
          },
        },
      },
    });

    if (!empresa) {
      throw new Error("Empresa no encontrada");
    }

    return { success: true, data: empresa };
  } catch (error) {
    console.error("Error obteniendo datos de suscripción:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Error al obtener datos",
    };
  }
}

/**
 * Obtener todas las empresas con suscripciones
 */
export async function getAllCompaniesWithSubscriptions() {
  try {
    const empresas = await prisma.empresa.findMany({
      include: {
        suscripcion: true,
        administradores: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
          take: 1,
        },
      },
      orderBy: {
        nombre: "asc",
      },
    });

    return { success: true, data: empresas };
  } catch (error) {
    console.error("Error obteniendo empresas:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Error al obtener empresas",
    };
  }
}
