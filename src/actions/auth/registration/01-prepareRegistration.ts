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
): Promise<ActionResponse<{ tempRegistrationId: string }>> {
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
  } = validationResult.data;

  try {
    // --- Validaciones (como antes) ---
    const existingAdmin = await prisma.administrador.findUnique({
      where: { documento },
    });
    if (existingAdmin)
      throw new Error("Ya existe un administrador con este documento");

    // buscar registro temporal por documento o email (para permitir editar/reutilizar)
    const existingTempRegistration = await prisma.tempRegistration.findFirst({
      where: {
        OR: [{ documento }, { email }],
      },
    });

    const existingAdminEmail = await prisma.administrador.findUnique({
      where: { email },
    });
    if (existingAdminEmail) throw new Error("Este email ya está registrado");

    const existingEmpresa = await prisma.empresa.findUnique({
      where: { nombre: nombreEmpresa },
    });
    if (existingEmpresa)
      throw new Error("Ya existe una empresa con este nombre");

    // --- Crear registro temporal ---
    const hashedPassword = await bcrypt.hash(password, 10);
    let tempRegistration;
    if (existingTempRegistration) {
      // actualizar el registro temporal existente con los nuevos datos
      tempRegistration = await prisma.tempRegistration.update({
        where: { id: existingTempRegistration.id },
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
    } else {
      tempRegistration = await prisma.tempRegistration.create({
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
    }

    console.log(
      "[prepareRegistration] tempRegistrationId:",
      tempRegistration.id
    );

    return {
      success: true,
      data: { tempRegistrationId: tempRegistration.id },
      message: "Registro preparado exitosamente",
    };
  } catch (error) {
    return handleActionError(
      error,
      "Ocurrió un error inesperado durante el registro."
    );
  }
}
