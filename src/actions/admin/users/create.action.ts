"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const addUserToAdmin = async (data: {
  nombre: string;
  apellido: string;
  documento: string;
  edad?: number;
  telefono?: string;
  administradorId: string;
  primerPagoMesSiguiente: boolean;
}) => {
  try {
    // Verificar si el usuario ya existe
    const existingUser = await prisma.usuario.findFirst({
      where: {
        documento: data.documento,
        administradorId: data.administradorId,
      },
    });

    if (existingUser) {
      throw new Error("Ya existe un usuario con este documento");
    }

    // Verificar que el administrador existe
    const adminExists = await prisma.administrador.findUnique({
      where: { id: data.administradorId },
      include: {
        configuracionTarifa: {
          include: {
            rangos: true,
          },
        },
      },
    });

    if (!adminExists) {
      throw new Error("Administrador no encontrado");
    }

    // Crear el nuevo usuario asociado al administrador
    const newUser = await prisma.usuario.create({
      data: {
        nombre: data.nombre.toLowerCase(),
        apellido: data.apellido.toLowerCase(),
        documento: data.documento,
        telefono: data.telefono || null,
        edad: data.edad ? +data.edad : null,
        administradorId: data.administradorId,
        estado: "ACTIVO", // Estado por defecto según tu modelo
        estaActivo: true, // Activo por defecto
      },
    });

    //crear nuevo pago
    if (data.primerPagoMesSiguiente) {
      await prisma.pago.create({
        data: {
          año: new Date().getFullYear(),
          mes: new Date().getMonth() + 2,
          periodo: `${new Date().getFullYear()}-${String(
            new Date().getMonth() + 2
          ).padStart(2, "0")}`,
          monto: adminExists.configuracionTarifa!.rangos[0].monto,
          usuarioId: newUser.id,
          estaVencido: false,
          estado: "PENDIENTE",
          metodo: "EFECTIVO",
          comprobante: null,
          fecha: new Date(),
        },
      });
    } else {
      await prisma.pago.create({
        data: {
          año: new Date().getFullYear(),
          mes: new Date().getMonth() + 1,
          periodo: `${new Date().getFullYear()}-${String(
            new Date().getMonth() + 1
          ).padStart(2, "0")}`,
          monto: adminExists.configuracionTarifa!.rangos[0].monto,
          usuarioId: newUser.id,
          estaVencido: false,
          estado: "PENDIENTE",
          metodo: "EFECTIVO",
          comprobante: null,
          fecha: new Date(),
        },
      });
    }

    revalidatePath("/admin/users/list");

    return newUser;
  } catch (error) {
    console.error("Error al agregar usuario:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Error desconocido al agregar usuario"
    );
  }
};
