"use server";

import moment from "moment-timezone";
import {
  actualizarTarifasFijas,
  generarPagosFuturos,
  procesarVencimientosDinamicos,
} from ".";
import { logger } from "../lib";
import { notificarVencimientosFijos } from "./notificarVencimientosFijos";
import { notificarVencimientosDinamicos } from "./notificarVencimientosDinamicos";

// Zona horaria de referencia
const TIMEZONE = "America/Argentina/Buenos_Aires";

/**
 * Obtiene la fecha de negocio (medianoche en Argentina)
 */
function getNormalizedBusinessDate(): Date {
  return moment().tz(TIMEZONE).startOf("day").toDate();
}

export async function processDailyComplete() {
  const cronId = `CRON-${Date.now()}`; // Para rastrear logs
  const tiempoInicio = Date.now();
  const fechaActual = getNormalizedBusinessDate();
  const mesActual = fechaActual.getMonth() + 1;
  const añoActual = fechaActual.getFullYear();
  const diaActual = fechaActual.getDate();

  logger.info(
    `[${cronId}] 🌅 Iniciando procesamiento completo: ${fechaActual.toLocaleDateString("es-AR")}`
  );

  // 📊 Contadores
  let totalPagosVencidos = 0;
  let totalRecargosAplicados = 0;
  let totalTarifasActualizadas = 0;
  let totalPagosFuturosGenerados = 0;
  let totalRecordatoriosEnviados = 0;

  // 🔥 PASO 1: Notificar vencimientos fijos
  logger.info(`[${cronId}] 📢 Notificando vencimientos de tarifas fijas...`);
  const resultadoNotificacionesFijas =
    await notificarVencimientosFijos(fechaActual);
  totalRecordatoriosEnviados +=
    resultadoNotificacionesFijas.notificacionesEnviadas;

  logger.info(
    `[${cronId}] 📢 Notificando vencimientos de tarifas dinámicas...`
  );
  const resultadoNotificacionesDinamicas =
    await notificarVencimientosDinamicos(fechaActual);
  totalRecordatoriosEnviados +=
    resultadoNotificacionesDinamicas.notificacionesEnviadas;

  // 🔥 PASO 2: Procesar vencimientos dinámicos
  logger.info(
    `[${cronId}] 🔍 Procesando vencimientos de configuración dinámica...`
  );
  const resultadoVencimientos =
    await procesarVencimientosDinamicos(fechaActual);
  totalPagosVencidos += resultadoVencimientos.pagosVencidos;
  totalRecargosAplicados += resultadoVencimientos.recargosAplicados;

  // 🔥 PASO 3: Actualizar tarifas fijas
  logger.info(`[${cronId}] 💰 Actualizando tarifas de configuración fija...`);
  const resultadoTarifas = await actualizarTarifasFijas(
    fechaActual,
    diaActual,
    mesActual,
    añoActual,
    cronId
  );
  totalTarifasActualizadas += resultadoTarifas.tarifasActualizadas;

  // 🔥 PASO 4: Generar pagos futuros
  logger.info(
    `[${cronId}] 📅 Generando pagos futuros para usuarios que ya pagaron...`
  );
  const resultadoFuturos = await generarPagosFuturos(
    fechaActual,
    mesActual,
    añoActual,
    cronId
  );
  totalPagosFuturosGenerados += resultadoFuturos.pagosGenerados;

  const tiempoEjecucion = Date.now() - tiempoInicio;

  // 📊 RESUMEN
  logger.info(
    `[${cronId}] ✅ Procesamiento completo finalizado en ${tiempoEjecucion}ms:`
  );
  logger.info(`  • Recordatorios enviados: ${totalRecordatoriosEnviados}`);
  logger.info(`  • Pagos vencidos procesados: ${totalPagosVencidos}`);
  logger.info(`  • Recargos aplicados: ${totalRecargosAplicados}`);
  logger.info(`  • Tarifas actualizadas: ${totalTarifasActualizadas}`);
  logger.info(`  • Pagos futuros generados: ${totalPagosFuturosGenerados}`);

  return {
    pagosVencidos: totalPagosVencidos,
    recargosAplicados: totalRecargosAplicados,
    tarifasActualizadas: totalTarifasActualizadas,
    pagosFuturosGenerados: totalPagosFuturosGenerados,
    recordatoriosEnviados: totalRecordatoriosEnviados,
    tiempoEjecucion,
    tipo: "diario_completo",
  };
}
