import { logger } from "../lib";
import {
  actualizarTarifasFijas,
  generarPagosFuturos,
  procesarVencimientosDinamicos,
} from ".";

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

  // 🔥 PASO 1: Procesar vencimientos (configuración dinámica)
  logger.info(
    "🔍 [PASO 1] Procesando vencimientos de configuración dinámica..."
  );
  const resultadoVencimientos = await procesarVencimientosDinamicos(
    fechaActual
  );
  totalPagosVencidos += resultadoVencimientos.pagosVencidos;
  totalRecargosAplicados += resultadoVencimientos.recargosAplicados;

  // 🔥 PASO 2: Actualizar tarifas (configuración fija)
  logger.info("💰 [PASO 2] Actualizando tarifas de configuración fija...");
  const resultadoTarifas = await actualizarTarifasFijas(
    fechaActual,
    diaActual,
    mesActual,
    añoActual
  );
  totalTarifasActualizadas += resultadoTarifas.tarifasActualizadas;

  // 🔥 PASO 3: Generar pagos futuros (usuarios que ya pagaron)
  logger.info(
    "📅 [PASO 3] Generando pagos futuros para usuarios que ya pagaron..."
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
  logger.info(`   • Pagos vencidos procesados: ${totalPagosVencidos}`);
  logger.info(`   • Recargos aplicados: ${totalRecargosAplicados}`);
  logger.info(`   • Tarifas actualizadas: ${totalTarifasActualizadas}`);
  logger.info(`   • Pagos futuros generados: ${totalPagosFuturosGenerados}`);

  return {
    pagosVencidos: totalPagosVencidos,
    recargosAplicados: totalRecargosAplicados,
    tarifasActualizadas: totalTarifasActualizadas,
    pagosFuturosGenerados: totalPagosFuturosGenerados,
    tiempoEjecucion,
    tipo: "diario_completo",
  };
}
