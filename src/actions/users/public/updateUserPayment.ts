"use server";
import prisma from "@/lib/prisma";
import type { MetodoPago } from "@prisma/client";

interface MercadoPagoPayment {
  id?: number;
  transaction_amount?: number;
  payment_method_id?: string;
  statement_descriptor?: string;
  metadata?: Record<string, unknown>;
}

export const updateUserPayment = async (payment: MercadoPagoPayment) => {
  try {
    // 1. Verificar que existan los metadatos necesarios
    if (!payment.metadata?.documento ||
      !payment.metadata?.admin_id ||
      !payment.metadata?.mes
    ) {
      throw new Error("Faltan metadatos requeridos");
    }

    const metadata = payment.metadata as {
      documento: string;
      admin_id: string;
      mes: string;
    };

    // 2. Buscar el usuario
    const user = await prisma.usuario.findFirst({
      where: {
        documento: metadata.documento,
        administradorId: metadata.admin_id,
      },
      include: {
        pagos: true,
      },
    });

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // 3. Mapear nombres de mes a números (puedes expandir esto según necesites)
    const meses: Record<string, number> = {
      Enero: 1,
      Febrero: 2,
      Marzo: 3,
      Abril: 4,
      Mayo: 5,
      Junio: 6,
      Julio: 7,
      Agosto: 8,
      Septiembre: 9,
      Octubre: 10,
      Noviembre: 11,
      Diciembre: 12,
    };

    const mesNumero = meses[metadata.mes];
    if (!mesNumero) {
      throw new Error("Mes no válido en los metadatos");
    }

    // 4. Obtener el año actual
    const añoActual = new Date().getFullYear();

    // 5. Buscar el pago correspondiente al mes/año
    const pagoExistente = user.pagos.find(
      (pago) => pago.mes === mesNumero && pago.año === añoActual
    );

    // 6. Actualizar o crear el pago
    if (pagoExistente) {
      // Actualizar pago existente
      await prisma.pago.update({
        where: { id: pagoExistente.id, usuarioId: pagoExistente.usuarioId },
        data: {
          fecha: new Date(),
          estado: "PAGADO",
          metodo: "MERCADOPAGO" as MetodoPago,
          comprobante: payment.id != null ? String(payment.id) : null, //paymentpayment.id,
          estaVencido: false,
        },
      });
    } else {
      // Crear nuevo pago
      await prisma.pago.create({
        data: {
          monto: (payment.transaction_amount ?? 0) / 100,
          fecha: new Date(),
          mes: mesNumero,
          año: añoActual,
          estado: "PAGADO",
          metodo: (payment.payment_method_id as MetodoPago) || "MERCADOPAGO",
          comprobante: payment.id != null ? String(payment.id) : null,
          estaVencido: false,
          usuarioId: user.id,
          periodo: `${añoActual}-${String(mesNumero).padStart(2, "0")}`,
        },
      });
    }

    // 7. Actualizar estado general del usuario si es necesario
    await prisma.usuario.update({
      where: { id: user.id },
      data: { estado: "ACTIVO" },
    });

    return "Actualización de pago exitosa";
  } catch (error) {
    console.error(error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Error en el servidor, intenta nuevamente"
    );
  }
};
