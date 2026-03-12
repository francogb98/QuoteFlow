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
import { ensureNextMonthPaymentsForPaidUsers } from "./ensureNextMonthPayments";

// Zona horaria de referencia
const TIMEZONE = "America/Argentina/Buenos_Aires";

/**
 * Obtiene la fecha de negocio (medianoche en Argentina)
 */
function getNormalizedBusinessDate(): Date {
  return moment().tz(TIMEZONE).startOf("day").toDate();
}

export async function processDailyComplete(/* params */) {
  // Ejecutar al inicio: asegurar pagos del mes siguiente para usuarios que pagaron el mes actual
  try {
    logger.info(
      "[cron-daily] Iniciando ensureNextMonthPaymentsForPaidUsers (inicio del cron diario)",
    );
    const result = await ensureNextMonthPaymentsForPaidUsers(
      new Date(),
      "cron-daily-ensure-next",
    );
    // logs resumidos para testeo
    const rAny = result as any; // tipado flexible para ajustarnos a la forma real del retorno
    logger.info(
      `[cron-daily] ensureNextMonthPaymentsForPaidUsers: usuariosProcesados=${rAny.checked ?? 0}, fallas=${rAny.failures?.length ?? 0}, pagosGenerados=${rAny.generados ?? rAny.checked ?? 0}`,
    );

    if (rAny.generadosUsers && rAny.generadosUsers.length > 0) {
      // mostrar detalle usuario(admin) -> pagoId
      const resumen = rAny.generadosUsers.map(
        (g: any) =>
          `${g.usuarioId} (admin: ${g.administradorId ?? "?"}:${g.administradorNombre ?? "?"}) -> pago:${g.pagoId ?? "?"}`,
      );
      logger.info(
        `[cron-daily] Pagos generados para usuarios: ${resumen.join(", ")}`,
      );
    }

    if (rAny.errores && rAny.errores.length > 0) {
      logger.warn(
        `[cron-daily] Errores al generar pagos para ${rAny.errores.length} usuarios. Revisar logs detallados.`,
      );
    }
  } catch (err) {
    // No abortar el cron: registramos y seguimos con el resto del procesamiento
    logger.error(
      "[cron-daily] Error en ensureNextMonthPaymentsForPaidUsers:",
      err,
    );
  }

  const cronId = `CRON-${Date.now()}`; // Para rastrear logs
  const tiempoInicio = Date.now();
  const fechaActual = getNormalizedBusinessDate();
  const mesActual = fechaActual.getMonth() + 1;
  const añoActual = fechaActual.getFullYear();
  const diaActual = fechaActual.getDate();

  logger.info(
    `[${cronId}] 🌅 Iniciando procesamiento completo: ${fechaActual.toLocaleDateString("es-AR")}`,
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
    `[${cronId}] 📢 Notificando vencimientos de tarifas dinámicas...`,
  );
  const resultadoNotificacionesDinamicas =
    await notificarVencimientosDinamicos(fechaActual);
  totalRecordatoriosEnviados +=
    resultadoNotificacionesDinamicas.notificacionesEnviadas;

  // 🔥 PASO 2: Procesar vencimientos dinámicos
  logger.info(
    `[${cronId}] 🔍 Procesando vencimientos de configuración dinámica...`,
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
    cronId,
  );
  totalTarifasActualizadas += resultadoTarifas.tarifasActualizadas;

  // 🔥 PASO 4: Generar pagos futuros
  logger.info(
    `[${cronId}] 📅 Generando pagos futuros para usuarios que ya pagaron...`,
  );
  const resultadoFuturos = await generarPagosFuturos(
    fechaActual,
    mesActual,
    añoActual,
    cronId,
  );
  totalPagosFuturosGenerados += resultadoFuturos.pagosGenerados;

  const tiempoEjecucion = Date.now() - tiempoInicio;

  // 📊 RESUMEN
  logger.info(
    `[${cronId}] ✅ Procesamiento completo finalizado en ${tiempoEjecucion}ms:`,
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
