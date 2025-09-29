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

export async function corregirMontosPagosPendientes() {
  console.log("--- 🛠️ INICIANDO CORRECCIÓN DE MONTOS DE PAGOS PENDIENTES ---");

  // Traigo los pagos pendientes con las relaciones de tarifa del usuario,
  // e incluyo el nombre del usuario y el administrador para el log de éxito.
  const pagosPendientes = await prisma.pago.findMany({
    where: { estado: "PENDIENTE" },
    include: {
      usuario: {
        select: {
          // Usamos select para traer solo lo necesario, incluyendo el administrador
          id: true,
          nombre: true,
          email: true,
          rangoTarifa: true,
          dinamicaTarifa: true,
          administrador: { select: { nombre: true } }, // Incluimos el nombre del administrador
        },
      },
    },
  });

  let pagosActualizados = 0;

  for (const pago of pagosPendientes) {
    const { usuario } = pago;
    if (!usuario) continue;

    let montoCorrecto: number | null = null;
    const montoAnterior = pago.monto; // Guardamos el monto actual para el log

    // 🔹 Prioridad: si el usuario tiene dinamicaTarifa
    if (usuario.dinamicaTarifa) {
      montoCorrecto = usuario.dinamicaTarifa.montoBase;
    }
    // 🔹 Si no, usamos el rangoTarifa
    else if (usuario.rangoTarifa) {
      montoCorrecto = usuario.rangoTarifa.monto;
    }

    // 🔹 Si se calculó monto y es distinto, actualizamos
    if (montoCorrecto !== null && montoAnterior !== montoCorrecto) {
      await prisma.pago.update({
        where: { id: pago.id },
        data: { monto: montoCorrecto },
      });

      pagosActualizados++;

      // LOG DETALLADO DE LA CORRECCIÓN REALIZADA
      console.log(`✅ PAGO CORREGIDO ID: ${pago.id}`);
      console.log(`  👤 Usuario: ${usuario.nombre} (ID: ${usuario.id})`);
      console.log(
        `  🏢 Administrador: ${usuario.administrador?.nombre || "N/A"}`
      );
      console.log(`  💰 Monto: ${montoAnterior} → ${montoCorrecto}`);
      console.log(
        "------------------------------------------------------------------"
      );
    }
  }

  console.log(`\n🔎 Total de pagos corregidos: ${pagosActualizados}`);
  return pagosActualizados;
}

export async function simularCorreccionMontosPagosPendientes() {
  console.log(
    "--- 🔎 SIMULACIÓN DE CORRECCIÓN DE MONTOS DE PAGOS PENDIENTES ---"
  );
  // Traigo los pagos pendientes con las relaciones de tarifa del usuario
  const pagosPendientes = await prisma.pago.findMany({
    where: { estado: "PENDIENTE" },
    include: {
      usuario: {
        select: {
          id: true,
          nombre: true, // Incluimos el nombre para mejor identificación en el log
          email: true, // Incluimos el email para mejor identificación en el log
          rangoTarifa: true,
          dinamicaTarifa: true,
          administrador: { select: { nombre: true } },
        },
      },
    },
  });

  let pagosSimuladosACorregir = 0;

  for (const pago of pagosPendientes) {
    const { usuario } = pago;
    if (!usuario) continue;

    let montoCorrecto: number | null = null;
    let tipoTarifaAplicada: "dinamicaTarifa" | "rangoTarifa" | "ninguna" =
      "ninguna";

    // 🔹 Prioridad: si el usuario tiene dinamicaTarifa
    if (usuario.dinamicaTarifa) {
      montoCorrecto = usuario.dinamicaTarifa.montoBase;
      tipoTarifaAplicada = "dinamicaTarifa";
    }
    // 🔹 Si no, usamos el rangoTarifa
    else if (usuario.rangoTarifa) {
      montoCorrecto = usuario.rangoTarifa.monto;
      tipoTarifaAplicada = "rangoTarifa";
    }

    // 🔹 Si se calculó monto y es distinto, registramos la corrección
    if (montoCorrecto !== null && pago.monto !== montoCorrecto) {
      pagosSimuladosACorregir++;

      console.log(
        `[SIMULACIÓN] ⚠️ Corrección propuesta para Pago ID: ${pago.id}`
      );
      console.log(
        `  👤 Usuario: ${usuario.nombre} (ID: ${usuario.id}, Email: ${usuario.email})`
      );
      console.log(`  🏢 Admin: ${usuario.administrador?.nombre || "N/A"}`);
      console.log(`  📅 Periodo: ${pago.periodo}`);
      console.log(`  💰 Monto Actual: ${pago.monto}`);
      console.log(
        `  ✅ Monto Corregido Propuesto: ${montoCorrecto} (Fuente: ${tipoTarifaAplicada})`
      );
      console.log(
        "------------------------------------------------------------------"
      );
    }
  }

  console.log(
    `\n✅ SIMULACIÓN COMPLETA. Total de pagos que SERÍAN corregidos: ${pagosSimuladosACorregir}`
  );
  return pagosSimuladosACorregir;
}
