"use server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function getAnalytics() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autenticado");
  }

  const fechaCreacion = session.user.empresa.fechaCreacion;
  const fechaInicio = new Date(fechaCreacion);

  // Traer los pagos de la empresa desde la fecha de creación
  const pagos = await prisma.pago.findMany({
    where: {
      usuario: { administrador: { empresaId: session.user.empresa.id } },
      fecha: { gte: fechaInicio },
    },
    select: {
      monto: true,
      estado: true,
      mes: true,
      año: true,
    },
  });

  function generarMeses(desde: Date, hasta: Date) {
    const meses = [];
    const fecha = new Date(desde);
    fecha.setDate(1);
    fecha.setHours(0, 0, 0, 0);

    const mesesNombres = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];

    while (fecha <= hasta) {
      meses.push({
        mes: fecha.getMonth() + 1,
        nombreMes: mesesNombres[fecha.getMonth()],
        año: fecha.getFullYear(),
      });
      fecha.setMonth(fecha.getMonth() + 1);
    }

    return meses;
  }

  // ⚡ calcular el último mes con pago
  let fechaFinal = new Date();
  if (pagos.length > 0) {
    const ultimoPago = pagos.reduce(
      (max: (typeof pagos)[0], p: any) =>
        p.año > max.año || (p.año === max.año && p.mes > max.mes) ? p : max,
      pagos[0]
    );
    fechaFinal = new Date(ultimoPago.año, ultimoPago.mes - 1); // -1 porque Date usa meses 0-11
  }

  const meses = generarMeses(fechaInicio, fechaFinal);

  const pagosPorMes = meses.map(({ mes, nombreMes, año }) => {
    const pagosDelMes = pagos.filter((p) => p.mes === mes && p.año === año);

    return {
      mes,
      nombreMes,
      año,
      totalPagos: pagosDelMes.length,
      pagosPagados: pagosDelMes.filter((p) => p.estado === "PAGADO").length,
      pagosPendientes: pagosDelMes.filter((p) => p.estado === "PENDIENTE")
        .length,
      pagosVencidos: pagosDelMes.filter((p) => p.estado === "VENCIDO").length,
      pagosRechazados: pagosDelMes.filter((p) => p.estado === "RECHAZADO")
        .length,
      montoTotal: pagosDelMes
        .filter((p) => p.estado === "PAGADO")
        .reduce((sum, p) => sum + p.monto, 0),
    };
  });

  // Calcular totales históricos
  const totalPagos = pagos.length;
  const totalPagados = pagos.filter((p) => p.estado === "PAGADO").length;
  const totalPendientes = pagos.filter((p) => p.estado === "PENDIENTE").length;
  const totalVencidos = pagos.filter((p) => p.estado === "VENCIDO").length;
  const totalRechazados = pagos.filter((p) => p.estado === "RECHAZADO").length;
  const totalMonto = pagos
    .filter((p) => p.estado === "PAGADO")
    .reduce((sum, p) => sum + p.monto, 0);

  return {
    pagosPorMes,
    estadisticasGenerales: {
      totalPagosHistoricos: totalPagos,
      montoTotalHistorico: totalMonto,
      pagosPagadosHistorico: totalPagados,
      pagosPendientesHistorico: totalPendientes,
      pagosVencidosHistorico: totalVencidos,
      pagosRechazadosHistorico: totalRechazados,
    },
    año: new Date().getFullYear(),
  };
}
