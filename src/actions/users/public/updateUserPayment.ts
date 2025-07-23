"use server";
import prisma from "@/lib/prisma";

export const updateUserPayment = async (payment: any) => {
  try {
    // 1. Verificar que existan los metadatos necesarios
    if (
      !payment.metadata?.documento ||
      !payment.metadata?.admin_id ||
      !payment.metadata?.mes
    ) {
      throw new Error("Faltan metadatos requeridos");
    }

    // 2. Buscar el usuario
    const user = await prisma.usuario.findFirst({
      where: {
        documento: payment.metadata.documento,
        administradorId: payment.metadata.admin_id,
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

    const mesNumero = meses[payment.metadata.mes];
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
          metodo: "MERCADOPAGO",
          comprobante: `${payment.id}`, //paymentpayment.id,
          estaVencido: false,
        },
      });
    } else {
      // Crear nuevo pago
      await prisma.pago.create({
        data: {
          monto: payment.amount / 100,
          fecha: new Date(),
          mes: mesNumero,
          año: añoActual,
          estado: "PAGADO",
          metodo: payment.payment_method || "MERCADOPAGO",
          comprobante: payment.receipt_url || null,
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
