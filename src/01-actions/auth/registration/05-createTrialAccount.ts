// src/01-actions/auth/registration/05-createTrialAccount.ts
"use server";

import { hash } from "bcryptjs";
import { TipoPlanEmpresa, FrecuenciaPago } from "@prisma/client";
import { addMonths } from "date-fns";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { ActionResponse, handleActionError } from "@/lib/utils/action-errors";

// Define Zod schema for CreateTrialAccountInput
const CreateTrialAccountSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(25),
  documento: z.string().min(1, "El documento es obligatorio").max(10),
  email: z.string().email("Correo inválido"),
  nombreEmpresa: z.string().min(1, "El nombre de la empresa es obligatorio").max(50),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").max(25, "La contraseña debe tener como máximo 25 caracteres"),
  telefono: z.string().min(1, "El teléfono es obligatorio").max(15),
  codigoPromocional: z.string().min(1, "El código promocional es obligatorio"),
});

interface CreateTrialAccountInput extends z.infer<typeof CreateTrialAccountSchema> {}

// Removed CreateTrialAccountResult interface

export async function createTrialAccount(
  input: CreateTrialAccountInput
): Promise<ActionResponse<{ empresaId: string }>> {
  try {
    // Validate input using Zod
    const validatedInput = CreateTrialAccountSchema.parse(input);

    // 1. Verificar que el código promocional existe y es válido
    const promoCode = await prisma.codigoPromocional.findUnique({
      where: { codigo: validatedInput.codigoPromocional, estaActivo: true },
    });

    if (!promoCode) {
      throw new Error("Código promocional no válido o no activo");
    }

    // 2. Verificar que el código no haya expirado (si tiene fecha de expiración)
    if (promoCode.fechaExpiracion && promoCode.fechaExpiracion < new Date()) {
      throw new Error("El código promocional ha expirado");
    }

    // 3. Verificar que el email y documento no estén en uso
    const existingAdmin = await prisma.administrador.findFirst({
      where: {
        OR: [{ email: validatedInput.email }, { documento: validatedInput.documento }],
      },
    });

    if (existingAdmin) {
      throw new Error(
        existingAdmin.email === validatedInput.email
          ? "El email ya está registrado"
          : "El documento ya está registrado"
      );
    }

    // 4. Verificar que el nombre de empresa no esté en uso
    const existingCompany = await prisma.empresa.findUnique({
      where: { nombre: validatedInput.nombreEmpresa },
    });

    if (existingCompany) {
      throw new Error("El nombre de empresa ya está en uso");
    }

    // 5. Hashear la contraseña
    const hashedPassword = await hash(validatedInput.password, 12);

    // 6. Calcular fecha de fin de prueba
    const fechaFinPrueba = addMonths(new Date(), promoCode.duracionMeses);

    // 7. Crear la empresa y el administrador en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear la empresa
      const empresa = await tx.empresa.create({
        data: {
          nombre: validatedInput.nombreEmpresa,
          planTipo: TipoPlanEmpresa.PRO, // Dar acceso PRO durante la prueba
          estadoPago: "ACTIVO",
          frecuenciaPago: FrecuenciaPago.MENSUAL,
          esCuentaPrueba: true,
          fechaFinPrueba,
          codigoPromocional: {
            connect: { id: promoCode.id },
          },
        },
      });

      // Crear el administrador
      const administrador = await tx.administrador.create({
        data: {
          nombre: validatedInput.nombre,
          documento: validatedInput.documento,
          email: validatedInput.email,
          password: hashedPassword,
          telefono: validatedInput.telefono,
          rol: "ADMINISTRADOR",
          empresa: {
            connect: { id: empresa.id },
          },
        },
      });

      // desactivar el codigo promocional
      await tx.codigoPromocional.update({
        where: { id: promoCode.id },
        data: { estaActivo: false },
      });

      return { empresa, administrador };
    });

    return {
      success: true,
      data: { empresaId: result.empresa.id },
      message: "Cuenta de prueba creada exitosamente",
    };
  } catch (error) {
    return handleActionError(error, "Error al crear la cuenta de prueba");
  }
}
