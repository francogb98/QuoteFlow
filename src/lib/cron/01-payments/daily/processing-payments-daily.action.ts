"use server";
import { logger } from "../lib";
import {
  actualizarTarifasFijas,
  generarPagosFuturos,
  procesarVencimientosDinamicos,
} from ".";
import { notificarVencimientosFijos } from "./notificarVencimientosFijos";
import { notificarVencimientosDinamicos } from "./notificarVencimientosDinamicos";

export async function processDailyComplete() {
  const tiempoInicio = Date.now();
  const fechaActual = new Date();
  const mesActual = fechaActual.getMonth() + 1;
  const añoActual = fechaActual.getFullYear();
  const diaActual = fechaActual.getDate();

  logger.info(
    `🌅 [DIARIO] Iniciando procesamiento completo: ${fechaActual.toLocaleDateString(
      "es-AR"
    )}`
  );

  // 📊 Contadores para el resumen
  let totalPagosVencidos = 0;
  let totalRecargosAplicados = 0;
  let totalTarifasActualizadas = 0;
  let totalPagosFuturosGenerados = 0;
  let totalRecordatoriosEnviados = 0; // NEW: Contador para los recordatorios

  // 🔥 PASO 1: Enviar recordatorios (NEW)
  logger.info("📢 [PASO EXTRA] Notificando vencimientos de tarifas fijas...");
  const resultadoNotificaciones = await notificarVencimientosFijos(fechaActual);

  totalRecordatoriosEnviados += resultadoNotificaciones.notificacionesEnviadas;
  logger.info(
    `📬 Recordatorios enviados: ${resultadoNotificaciones.notificacionesEnviadas}`
  );
  logger.info(
    "📢 [PASO EXTRA] Notificando vencimientos de tarifas dinámicas..."
  );
  const resultadoNotificacionesDinamicas =
    await notificarVencimientosDinamicos(fechaActual);
  totalRecordatoriosEnviados +=
    resultadoNotificacionesDinamicas.notificacionesEnviadas;
  logger.info(
    `📬 Recordatorios dinámicos enviados: ${resultadoNotificacionesDinamicas.notificacionesEnviadas}`
  );

  // 🔥 PASO 2: Procesar vencimientos (configuración dinámica)
  logger.info(
    "🔍 [PASO 2] Procesando vencimientos de configuración dinámica..."
  );
  const resultadoVencimientos =
    await procesarVencimientosDinamicos(fechaActual);
  totalPagosVencidos += resultadoVencimientos.pagosVencidos;
  totalRecargosAplicados += resultadoVencimientos.recargosAplicados;

  // 🔥 PASO 3: Actualizar tarifas (configuración fija)
  logger.info("💰 [PASO 3] Actualizando tarifas de configuración fija...");
  const resultadoTarifas = await actualizarTarifasFijas(
    fechaActual,
    diaActual,
    mesActual,
    añoActual
  );
  totalTarifasActualizadas += resultadoTarifas.tarifasActualizadas;

  // 🔥 PASO 4: Generar pagos futuros (usuarios que ya pagaron)
  logger.info(
    "📅 [PASO 4] Generando pagos futuros para usuarios que ya pagaron..."
  );

  const resultadoFuturos = await generarPagosFuturos(
    fechaActual,
    mesActual,
    añoActual
  );
  totalPagosFuturosGenerados += resultadoFuturos.pagosGenerados;

  const tiempoEjecucion = Date.now() - tiempoInicio;

  // 📊 RESUMEN FINAL
  logger.info(
    `✅ [DIARIO] Procesamiento completo finalizado en ${tiempoEjecucion}ms:`
  );
  logger.info(`  • Recordatorios enviados: ${totalRecordatoriosEnviados}`); // NEW: Resumen del paso
  logger.info(`  • Pagos vencidos procesados: ${totalPagosVencidos}`);
  logger.info(`  • Recargos aplicados: ${totalRecargosAplicados}`);
  logger.info(`  • Tarifas actualizadas: ${totalTarifasActualizadas}`);
  logger.info(`  • Pagos futuros generados: ${totalPagosFuturosGenerados}`);

  return {
    pagosVencidos: totalPagosVencidos,
    recargosAplicados: totalRecargosAplicados,
    tarifasActualizadas: totalTarifasActualizadas,
    pagosFuturosGenerados: totalPagosFuturosGenerados,
    recordatoriosEnviados: totalRecordatoriosEnviados, // NEW: Devolver el contador en el objeto
    tiempoEjecucion,
    tipo: "diario_completo",
  };
}
