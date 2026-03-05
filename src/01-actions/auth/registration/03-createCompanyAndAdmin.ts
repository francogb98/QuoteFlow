import prisma from "@/lib/prisma";
import { FrecuenciaPago, Rol } from "@prisma/client";

interface CreateCompanyAndAdminResult {
  ok: boolean;
  message?: string;
  error?: string;
  empresaId?: string;
}

export async function createCompanyAndAdmin(
  tempRegistrationId: string,
  preapprovalId: string, // Aceptamos el preapprovalId como un argumento separado
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

    // Verificar si la empresa o el administrador ya fueron creados
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

    const fechaUltimoPago: Date = new Date();
    const fechaProximoVencimiento: Date = new Date();

    if (tempRegistration.frecuenciaPago === FrecuenciaPago.MENSUAL) {
      fechaProximoVencimiento.setMonth(fechaProximoVencimiento.getMonth() + 1);
    } else if (tempRegistration.frecuenciaPago === FrecuenciaPago.ANUAL) {
      fechaProximoVencimiento.setFullYear(
        fechaProximoVencimiento.getFullYear() + 1,
      );
    }

    // Crear la nueva Empresa y el Administrador en una transacción
    const newEmpresa = await prisma.empresa.create({
      data: {
        nombre: tempRegistration.nombreEmpresa,
        planTipo: tempRegistration.planTipo,
        frecuenciaPago: tempRegistration.frecuenciaPago,
        estadoPago: "ACTIVO",
        fechaProximoVencimiento: fechaProximoVencimiento,
        fechaUltimoPago: fechaUltimoPago,
        estaActiva: true,
        // --- CAMBIO CLAVE ---
        // Guardamos el ID de la pre-aprobación en el nuevo campo de la empresa
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

    await prisma.tempRegistration.delete({ where: { id: tempRegistrationId } });

    return {
      ok: true,
      message: "Empresa y administrador registrados exitosamente.",
      empresaId: newEmpresa.id,
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
