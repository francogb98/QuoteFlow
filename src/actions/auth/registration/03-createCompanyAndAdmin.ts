import prisma from "@/lib/prisma";
import { FrecuenciaPago, Rol, EstadoSuscripcion } from "@prisma/client";

interface CreateCompanyAndAdminResult {
  ok: boolean;
  message?: string;
  error?: string;
  empresaId?: string;
  suscripcionId?: string;
}

export async function createCompanyAndAdmin(
  tempRegistrationId: string,
  preapprovalId: string,
): Promise<CreateCompanyAndAdminResult> {
  try {
    const tempRegistration = await prisma.tempRegistration.findUnique({
      where: { id: tempRegistrationId },
    });

    if (!tempRegistration) {
      return {
        ok: false,
        error: "Datos de registro temporal no encontrados o expirados.",
      };
    }

    // Verificar si la empresa ya fue creada (idempotencia)
    const existingEmpresa = await prisma.empresa.findUnique({
      where: { nombre: tempRegistration.nombreEmpresa },
    });

    if (existingEmpresa) {
      await prisma.tempRegistration.delete({
        where: { id: tempRegistrationId },
      });
      return {
        ok: true,
        message: "Empresa ya registrada.",
        empresaId: existingEmpresa.id,
      };
    }

    // Verificar si el admin ya fue creado
    const existingAdmin = await prisma.administrador.findUnique({
      where: { documento: tempRegistration.documento },
    });

    if (existingAdmin) {
      await prisma.tempRegistration.delete({
        where: { id: tempRegistrationId },
      });
      return {
        ok: true,
        message: "Administrador ya registrado.",
        empresaId: existingAdmin.empresaId,
      };
    }

    // Calcular fechas según frecuencia de pago
    const ahora = new Date();
    const months = tempRegistration.frecuenciaPago === FrecuenciaPago.ANUAL ? 12 : 1;
    const fechaFinPeriodo = new Date(ahora);
    fechaFinPeriodo.setMonth(fechaFinPeriodo.getMonth() + months);

    // Crear Empresa + Administrador + SuscripcionEmpresa en una transacción
    const result = await prisma.$transaction(async (tx) => {
      const empresa = await tx.empresa.create({
        data: {
          nombre: tempRegistration.nombreEmpresa,
          planTipo: tempRegistration.planTipo,
          frecuenciaPago: tempRegistration.frecuenciaPago,
          estadoPago: "ACTIVO",
          fechaProximoVencimiento: fechaFinPeriodo,
          fechaUltimoPago: ahora,
          estaActiva: true,
          mercadoPagoPreApprovalId: preapprovalId,
          administradores: {
            create: {
              nombre: tempRegistration.nombre,
              email: tempRegistration.email,
              documento: tempRegistration.documento,
              password: tempRegistration.password,
              telefono: tempRegistration.telefono,
              rol: Rol.ADMINISTRADOR,
            },
          },
        },
      });

      const suscripcion = await tx.suscripcionEmpresa.create({
        data: {
          empresaId: empresa.id,
          planTipo: tempRegistration.planTipo,
          frecuenciaPago: tempRegistration.frecuenciaPago,
          mercadoPagoPreApprovalId: preapprovalId,
          estadoSuscripcion: EstadoSuscripcion.ACTIVA,
          fechaInicio: ahora,
          fechaFinPeriodoActual: fechaFinPeriodo,
        },
      });

      return { empresa, suscripcion };
    });

    await prisma.tempRegistration.delete({ where: { id: tempRegistrationId } });

    return {
      ok: true,
      message: "Empresa, administrador y suscripción registrados exitosamente.",
      empresaId: result.empresa.id,
      suscripcionId: result.suscripcion.id,
    };
  } catch (error: any) {
    console.error(
      "Error al crear empresa y administrador después del pago:",
      error,
    );
    return {
      ok: false,
      error: error.message || "Error desconocido al finalizar el registro.",
    };
  }
}
