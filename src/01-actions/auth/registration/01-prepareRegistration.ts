"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { TipoPlanEmpresa, FrecuenciaPago } from "@prisma/client";
import { PrepareRegistrationSchema } from "@/lib/schemas-zod";

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

interface PrepareRegistrationResult {
  success: boolean;
  message?: string;
  error?: {
    field?: string;
    message: string;
  };
  tempRegistrationId?: string;
}

export async function prepareRegistrationForPayment(
  data: PrepareRegistrationData
): Promise<PrepareRegistrationResult> {
  const {
    nombre,
    documento,
    nombreEmpresa,
    password,
    telefono,
    planTipo,
    frecuenciaPago,
    email,
  } = data;

  // Validación de campos requeridos
  const validationResult = PrepareRegistrationSchema.safeParse(data);

  if (!validationResult.success) {
    const firstError = validationResult.error.issues[0];
    return {
      success: false,
      error: {
        field: firstError.path.join("."),
        message: firstError.message,
      },
    };
  }

  try {
    // Validación de documento único
    const existingAdmin = await prisma.administrador.findUnique({
      where: { documento },
    });
    if (existingAdmin) {
      return {
        success: false,
        error: {
          field: "documento",
          message: "Ya existe un administrador con este documento",
        },
      };
    }

    const existingTempRegistration = await prisma.tempRegistration.findUnique({
      where: { documento },
    });
    if (existingTempRegistration) {
      return {
        success: false,
        error: {
          field: "documento",
          message: "Ya existe un registro pendiente para este documento",
        },
      };
    }
    // Validación de email único
    const existingAdminEmail = await prisma.administrador.findUnique({
      where: { email },
    });
    if (existingAdminEmail) {
      return {
        success: false,
        error: {
          field: "email",
          message: "Este email ya está registrado",
        },
      };
    }

    // Validación de nombre de empresa único
    const existingEmpresa = await prisma.empresa.findUnique({
      where: { nombre: nombreEmpresa },
    });
    if (existingEmpresa) {
      return {
        success: false,
        error: {
          field: "nombreEmpresa",
          message: "Ya existe una empresa con este nombre",
        },
      };
    }

    // Validación de contraseña
    if (password.length < 8) {
      return {
        success: false,
        error: {
          field: "password",
          message: "La contraseña debe tener al menos 8 caracteres",
        },
      };
    }

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
      tempRegistrationId: tempRegistration.id,
      message: "Registro preparado exitosamente",
    };
  } catch (error: any) {
    console.error("Error en prepareRegistrationForPayment:", error);
    return {
      success: false,
      error: {
        message: "Ocurrió un error inesperado. Por favor intenta nuevamente",
      },
    };
  }
}
