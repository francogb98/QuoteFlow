"use server";

import { hash } from "bcryptjs";
import {
  TipoPlanEmpresa,
  FrecuenciaPago,
  EstadoSuscripcion,
} from "@prisma/client";
import { addMonths } from "date-fns";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { ActionResponse, handleActionError } from "@/lib/utils/action-errors";

// -------------------------
// Schema de validación
// -------------------------

const CreateTrialAccountSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(25),
  documento: z.string().min(1, "El documento es obligatorio").max(10),
  email: z.string().email("Correo inválido"),
  nombreEmpresa: z
    .string()
    .min(1, "El nombre de la empresa es obligatorio")
    .max(50),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(25, "La contraseña debe tener máximo 25 caracteres"),
  telefono: z.string().min(1, "El teléfono es obligatorio").max(15),
  codigoPromocional: z.string().min(1, "El código promocional es obligatorio"),
});

type CreateTrialAccountInput = z.infer<typeof CreateTrialAccountSchema>;

// -------------------------
// Action
// -------------------------

export async function createTrialAccount(
  input: CreateTrialAccountInput,
): Promise<ActionResponse<{ empresaId: string }>> {
  try {
    const validatedInput = CreateTrialAccountSchema.parse(input);

    // 1️⃣ Verificar código promocional
    const promoCode = await prisma.codigoPromocional.findUnique({
      where: {
        codigo: validatedInput.codigoPromocional,
        estaActivo: true,
      },
    });

    if (!promoCode) {
      throw new Error("Código promocional no válido o no activo");
    }

    // 2️⃣ Verificar expiración del código
    if (promoCode.fechaExpiracion && promoCode.fechaExpiracion < new Date()) {
      throw new Error("El código promocional ha expirado");
    }

    // 3️⃣ Verificar email y documento
    const existingAdmin = await prisma.administrador.findFirst({
      where: {
        OR: [
          { email: validatedInput.email },
          { documento: validatedInput.documento },
        ],
      },
    });

    if (existingAdmin) {
      throw new Error(
        existingAdmin.email === validatedInput.email
          ? "El email ya está registrado"
          : "El documento ya está registrado",
      );
    }

    // 4️⃣ Verificar empresa
    const existingCompany = await prisma.empresa.findUnique({
      where: { nombre: validatedInput.nombreEmpresa },
    });

    if (existingCompany) {
      throw new Error("El nombre de empresa ya está en uso");
    }

    // 5️⃣ Hash password
    const hashedPassword = await hash(validatedInput.password, 12);

    // 6️⃣ Calcular duración del trial
    const fechaFinTrial = addMonths(new Date(), promoCode.duracionMeses);

    // -------------------------
    // Transacción
    // -------------------------

    const result = await prisma.$transaction(async (tx) => {
      // Crear empresa
      const empresa = await tx.empresa.create({
        data: {
          nombre: validatedInput.nombreEmpresa,
          planTipo: TipoPlanEmpresa.PRO,
          frecuenciaPago: FrecuenciaPago.MENSUAL,
          esCuentaPrueba: true,

          codigoPromocional: {
            connect: { id: promoCode.id },
          },
        },
      });

      // Crear suscripción en modo TRIAL
      const suscripcion = await tx.suscripcionEmpresa.create({
        data: {
          empresaId: empresa.id,

          planTipo: TipoPlanEmpresa.PRO,
          frecuenciaPago: FrecuenciaPago.MENSUAL,

          estadoSuscripcion: EstadoSuscripcion.TRIAL,

          fechaInicio: new Date(),
          fechaFinPeriodoActual: fechaFinTrial,
        },
      });

      // Crear administrador
      const administrador = await tx.administrador.create({
        data: {
          nombre: validatedInput.nombre,
          documento: validatedInput.documento,
          email: validatedInput.email,
          password: hashedPassword,
          telefono: validatedInput.telefono,
          rol: "ADMINISTRADOR",
          empresaId: empresa.id,
        },
      });

      // Desactivar código
      await tx.codigoPromocional.update({
        where: { id: promoCode.id },
        data: { estaActivo: false },
      });

      return { empresa, administrador, suscripcion };
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
