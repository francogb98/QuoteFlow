import prisma from "@/prisma";
import { FrecuenciaPago, Rol } from "@prisma/client";

interface CreateCompanyAndAdminResult {
  ok: boolean;
  message?: string;
  error?: string;
  empresaId?: string;
}

export async function createCompanyAndAdmin(
  tempRegistrationId: string
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

    // Verificar si la empresa o el administrador ya fueron creados (por si acaso)
    const existingEmpresa = await prisma.empresa.findUnique({
      where: { nombre: tempRegistration.nombreEmpresa },
    });

    //si la empresa existe devolvemos que ya fue registrada y borramos el tempRegistration
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

    //verificamos si el admin ya fue registrado
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

    // Calcular fechas de vencimiento y último pago
    const fechaUltimoPago: Date = new Date(); // Se crea después del pago
    const fechaProximoVencimiento: Date = new Date();

    if (tempRegistration.frecuenciaPago === FrecuenciaPago.MENSUAL) {
      fechaProximoVencimiento.setMonth(fechaProximoVencimiento.getMonth() + 1);
    } else if (tempRegistration.frecuenciaPago === FrecuenciaPago.ANUAL) {
      fechaProximoVencimiento.setFullYear(
        fechaProximoVencimiento.getFullYear() + 1
      );
    }

    // Crear la nueva Empresa y el Administrador en una transacción
    const newEmpresa = await prisma.empresa.create({
      data: {
        nombre: tempRegistration.nombreEmpresa,
        planTipo: tempRegistration.planTipo,
        frecuenciaPago: tempRegistration.frecuenciaPago,
        estadoPago: "ACTIVO", // Ya se pagó, por lo tanto ACTIVO
        fechaProximoVencimiento: fechaProximoVencimiento,
        fechaUltimoPago: fechaUltimoPago,
        estaActiva: true,
        administradores: {
          create: {
            nombre: tempRegistration.nombre,
            email: tempRegistration.email,
            documento: tempRegistration.documento,
            password: tempRegistration.password, // Contraseña ya hasheada
            telefono: tempRegistration.telefono,
            rol: Rol.ADMINISTRADOR,
          },
        },
      },
    });

    // Eliminar la entrada temporal después de la creación exitosa
    await prisma.tempRegistration.delete({ where: { id: tempRegistrationId } });

    return {
      ok: true,
      message: "Empresa y administrador registrados exitosamente.",
      empresaId: newEmpresa.id,
    };
  } catch (error: any) {
    console.error(
      "Error al crear empresa y administrador después del pago:",
      error
    );
    return {
      ok: false,
      error: error.message || "Error desconocido al finalizar el registro.",
    };
  }
}
