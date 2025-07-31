import prisma from "@/lib/prisma";
import { calculateNextPaymentDate } from "./calculations";

export async function generarProximoPago(
  usuario: any,
  configuracion: any,
  pagoReferencia: any,
  fechaActual: Date
) {
  let proximaFecha: Date;
  let monto: number;

  if (configuracion.tipoConfiguracion === "DINAMICA_POR_FECHA_INGRESO") {
    proximaFecha = calculateNextPaymentDate(pagoReferencia);
    monto = configuracion.montoBase || 0;
  } else {
    const rangos = configuracion.rangos;
    if (!rangos || rangos.length === 0) return null;

    proximaFecha = new Date(fechaActual);
    proximaFecha.setMonth(proximaFecha.getMonth() + 1);
    proximaFecha.setDate(rangos[0].diaInicio);
    monto = rangos[0].monto;
  }

  const proximoPeriodo = `${proximaFecha.getFullYear()}-${String(
    proximaFecha.getMonth() + 1
  ).padStart(2, "0")}`;

  // Verificación de duplicados
  const pagoExistente = await prisma.pago.findFirst({
    where: {
      usuarioId: usuario.id,
      periodo: proximoPeriodo,
    },
    select: { id: true },
  });

  if (pagoExistente) {
    return null;
  }

  // Crear el nuevo pago
  const nuevoPago = await prisma.pago.create({
    data: {
      usuarioId: usuario.id,
      monto,
      mes: proximaFecha.getMonth() + 1,
      año: proximaFecha.getFullYear(),
      periodo: proximoPeriodo,
      fechaVencimiento: proximaFecha,
      estado: "PENDIENTE",
      metodo: "EFECTIVO",
    },
  });

  return nuevoPago;
}
