// src/01-actions/auth/registration/05-createTrialAccount.ts
"use server";

import { hash } from "bcryptjs";
import { TipoPlanEmpresa, FrecuenciaPago } from "@prisma/client";
import { addMonths } from "date-fns";
import prisma from "@/lib/prisma";

interface CreateTrialAccountInput {
  nombre: string;
  documento: string;
  email: string;
  nombreEmpresa: string;
  password: string;
  telefono: string;
  codigoPromocional: string;
}

interface CreateTrialAccountResult {
  success: boolean;
  message?: string;
  error?: string;
  empresaId?: string;
}

export async function createTrialAccount(
  input: CreateTrialAccountInput
): Promise<CreateTrialAccountResult> {
  try {
    // 1. Verificar que el código promocional existe y es válido
    const promoCode = await prisma.codigoPromocional.findUnique({
      where: { codigo: input.codigoPromocional, estaActivo: true },
    });

    if (!promoCode) {
      return {
        success: false,
        error: "Código promocional no válido o no activo",
      };
    }

    // 2. Verificar que el código no haya expirado (si tiene fecha de expiración)
    if (promoCode.fechaExpiracion && promoCode.fechaExpiracion < new Date()) {
      return {
        success: false,
        error: "El código promocional ha expirado",
      };
    }

    // 3. Verificar que el email y documento no estén en uso
    const existingAdmin = await prisma.administrador.findFirst({
      where: {
        OR: [{ email: input.email }, { documento: input.documento }],
      },
    });

    if (existingAdmin) {
      return {
        success: false,
        error:
          existingAdmin.email === input.email
            ? "El email ya está registrado"
            : "El documento ya está registrado",
      };
    }

    // 4. Verificar que el nombre de empresa no esté en uso
    const existingCompany = await prisma.empresa.findUnique({
      where: { nombre: input.nombreEmpresa },
    });

    if (existingCompany) {
      return {
        success: false,
        error: "El nombre de empresa ya está en uso",
      };
    }

    // 5. Hashear la contraseña
    const hashedPassword = await hash(input.password, 12);

    // 6. Calcular fecha de fin de prueba
    const fechaFinPrueba = addMonths(new Date(), promoCode.duracionMeses);

    // 7. Crear la empresa y el administrador en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear la empresa
      const empresa = await tx.empresa.create({
        data: {
          nombre: input.nombreEmpresa,
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
          nombre: input.nombre,
          documento: input.documento,
          email: input.email,
          password: hashedPassword,
          telefono: input.telefono,
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
      message: "Cuenta de prueba creada exitosamente",
      empresaId: result.empresa.id,
    };
  } catch (error: any) {
    console.error("Error creando cuenta de prueba:", error);
    return {
      success: false,
      error: "Error al crear la cuenta de prueba",
    };
  }
}
