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

    // 👇 monto desde la tarifa dinámica del usuario
    if (usuario.dinamicaTarifa) {
      monto = usuario.dinamicaTarifa.montoBase;
      // acá podrías sumar lógica para diasGracia / recargo
    }
  } else {
    const rangos = configuracion.rangos;
    if (!rangos || rangos.length === 0) return null;

    proximaFecha = new Date(fechaActual);
    proximaFecha.setMonth(proximaFecha.getMonth() + 1);

    // 👇 si el usuario tiene rango asignado, usar ese
    if (usuario.rangoTarifa) {
      proximaFecha.setDate(usuario.rangoTarifa.diaInicio);
      monto = usuario.rangoTarifa.monto;
    } else {
      // fallback al primer rango
      proximaFecha.setDate(rangos[0].diaInicio);
      monto = rangos[0].monto;
    }
  }

  if (!monto) {
    console.warn(`⚠️ No se pudo calcular monto para usuario ${usuario.id}`);
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

  // Crear el nuevo pago
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
