import prisma from "@/lib/prisma";
import { calculateNextPaymentDate } from "./calculations";

export async function generarProximoPago(
  usuario: any,
  configuracion: any,
  pagoReferencia: any,
  fechaActual: Date
) {
  let proximaFecha: Date;
  let monto: number | null = null;

  if (configuracion.tipoConfiguracion === "DINAMICA_POR_FECHA_INGRESO") {
    proximaFecha = calculateNextPaymentDate(pagoReferencia);

    // Siempre usar montoBase de la tarifa dinámica
    if (usuario.dinamicaTarifa) {
      monto = usuario.dinamicaTarifa.montoBase;
    }
  } else {
    const rangos = configuracion.rangos;
    if (!rangos || rangos.length === 0) return null;

    proximaFecha = new Date(fechaActual);
    proximaFecha.setMonth(proximaFecha.getMonth() + 1);

    // Si el usuario tiene rango asignado, usar su monto base
    if (usuario.rangoTarifa) {
      proximaFecha.setDate(usuario.rangoTarifa.diaInicio);
      monto = usuario.rangoTarifa.monto;
    } else {
      // fallback al primer rango definido en la config
      proximaFecha.setDate(rangos[0].diaInicio);
      monto = rangos[0].monto;
    }
  }

  if (!monto) {
    console.warn(
      `⚠️ No se pudo calcular monto base para usuario ${usuario.id}`
    );
    return null;
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

  if (pagoExistente) return null;

  // Crear el nuevo pago siempre con monto base
  return await prisma.pago.create({
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
}
