"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { TipoPlanEmpresa, FrecuenciaPago } from "@prisma/client";
import { PrepareRegistrationSchema } from "@/lib/schemas-zod";
import { ActionResponse, handleActionError } from "@/lib/utils/action-errors";
import { z } from "zod";

interface PrepareRegistrationData {
  nombre: string;
  documento: string;
  email: string;
  nombreEmpresa: string;
  password: string;
  telefono: string;
  planTipo: TipoPlanEmpresa;
  frecuenciaPago: FrecuenciaPago;
}

// Removed PrepareRegistrationResult interface

export async function prepareRegistrationForPayment(
  data: z.infer<typeof PrepareRegistrationSchema>
): Promise<ActionResponse<string>> { // Updated return type to ActionResponse
  // Zod validation is performed first
  const validationResult = PrepareRegistrationSchema.safeParse(data);

  if (!validationResult.success) {
    const firstError = validationResult.error.issues[0];
    throw new Error(`${firstError.path.join(".")} ${firstError.message}`);
  }

  const {
    nombre,
    documento,
    nombreEmpresa,
    password,
    telefono,
    planTipo,
    frecuenciaPago,
    email,
  } = validationResult.data; // Use validated data

  try {
    // Validación de documento único
    const existingAdmin = await prisma.administrador.findUnique({
      where: { documento },
    });
    if (existingAdmin) {
      throw new Error("Ya existe un administrador con este documento");
    }

    const existingTempRegistration = await prisma.tempRegistration.findUnique({
      where: { documento },
    });
    if (existingTempRegistration) {
      throw new Error("Ya existe un registro pendiente para este documento");
    }
    // Validación de email único
    const existingAdminEmail = await prisma.administrador.findUnique({
      where: { email },
    });
    if (existingAdminEmail) {
      throw new Error("Este email ya está registrado");
    }

    // Validación de nombre de empresa único
    const existingEmpresa = await prisma.empresa.findUnique({
      where: { nombre: nombreEmpresa },
    });
    if (existingEmpresa) {
      throw new Error("Ya existe una empresa con este nombre");
    }

    // Password validation is now handled by Zod schema, remove explicit check here if schema handles it.
    // If additional password complexity checks are needed beyond Zod's min/max length, add them here.

    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear registro temporal
    const tempRegistration = await prisma.tempRegistration.create({
      data: {
        nombre,
        documento,
        nombreEmpresa,
        password: hashedPassword,
        telefono,
        email,
        planTipo,
        frecuenciaPago,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return {
      success: true,
      data: tempRegistration.id, // Return tempRegistrationId in data
      message: "Registro preparado exitosamente",
    };
  } catch (error) {
    return handleActionError(error, "Ocurrió un error inesperado durante el registro.");
  }
}
