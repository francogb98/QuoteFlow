"use server";

import { logger } from "@/lib/cron/01-payments/lib";
import prisma from "@/lib/prisma";

/**
 * Convierte pagos del mes siguiente que estén vencidos a PENDIENTE
 */
export async function revertirVencidosDelMesSiguiente(fechaActual: Date) {
  // Calcular mes y año siguiente
  let mesSiguiente = fechaActual.getMonth() + 2; // +1 por 0-based, +1 para siguiente mes
  let añoSiguiente = fechaActual.getFullYear();

  if (mesSiguiente > 12) {
    mesSiguiente = 1;
    añoSiguiente++;
  }

  // Buscar pagos del mes siguiente que estén vencidos
  const pagosVencidos = await prisma.pago.findMany({
    where: {
      mes: mesSiguiente,
      año: añoSiguiente,
      estado: "VENCIDO",
    },
    include: {
      usuario: {
        include: {
          administrador: {
            select: { nombre: true },
          },
        },
      },
    },
  });

  logger.info(
    `🔍 Encontrados ${pagosVencidos.length} pagos del mes ${mesSiguiente}/${añoSiguiente} en estado VENCIDO`
  );

  let pagosRevertidos = 0;

  for (const pago of pagosVencidos) {
    await prisma.pago.update({
      where: { id: pago.id },
      data: {
        estado: "PENDIENTE",
        estaVencido: false,
      },
    });

    pagosRevertidos++;

    logger.debug(
      `♻️ Pago revertido a PENDIENTE: Usuario ${pago.usuario.nombre} - Periodo ${pago.periodo}`
    );
  }

  logger.info(`✅ Total pagos revertidos: ${pagosRevertidos}`);

  return { pagosRevertidos };
}

export async function pagosMontoCero() {
  const pagosCero = await prisma.pago.findMany({
    where: { monto: 0 },
    include: {
      usuario: {
        include: {
          rangoTarifa: true,
          dinamicaTarifa: true,
          administrador: { select: { nombre: true } },
        },
      },
    },
  });

  logger.info(`🔍 Encontrados ${pagosCero.length} pagos con monto 0`);

  for (const pago of pagosCero) {
    const { usuario } = pago;
    let montoAsignado: number | null = null;

    // Si el usuario tiene rangoTarifa
    if (usuario.rangoTarifa) {
      montoAsignado = usuario.rangoTarifa.monto;
    }

    // Si tiene dinamicaTarifa
    if (!montoAsignado && usuario.dinamicaTarifa) {
      montoAsignado = usuario.dinamicaTarifa.montoBase;
      // Podés aplicar lógica extra acá si hay días de gracia o recargo
    }

    if (montoAsignado) {
      await prisma.pago.update({
        where: { id: pago.id },
        data: { monto: montoAsignado },
      });

      logger.info(
        `💰 Pago actualizado -> Usuario: ${usuario.nombre} | Periodo: ${pago.periodo} | Monto asignado: ${montoAsignado}`
      );
    } else {
      logger.warn(
        `⚠️ No se encontró configuración de tarifa para el usuario ${usuario.nombre} (ID: ${usuario.id}), Pago ${pago.id}`
      );
    }
  }
}
