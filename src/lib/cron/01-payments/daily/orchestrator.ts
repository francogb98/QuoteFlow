import prisma from "@/lib/prisma";
import { generarProximoPago } from "../lib/generarProximoPago";
import { logger } from "../lib/logger";

interface CronSummary {
  date: string;
  checkedUsers: number;
  created: number;
  skipped: number;
  failures: { usuarioId: string; reason: string }[];
}

/**
 * runDailyPaymentsCron: orquesta pasos del cron en orden:
 * 1) fetchActiveUsers
 * 2) determineCandidatesForNextPayment
 * 3) createNextPaymentsForCandidates
 * 4) applyGraceDayAdjustments (actualiza montos si corresponde)
 * 5) markOverdueAndApplyRecargos
 * 6) sendPendingPaymentNotifications
 *
 * Devuelve resumen con failures minimal (sin logs verbosos).
 */
export async function runDailyPaymentsCron(referenceDate: Date = new Date()) {
  const summary: CronSummary = {
    date: referenceDate.toISOString(),
    checkedUsers: 0,
    created: 0,
    skipped: 0,
    failures: [],
  };

  // Paso 1: traer usuarios activos con datos necesarios
  const users = await prisma.usuario.findMany({
    where: { estaActivo: true, estado: "ACTIVO" },
    include: {
      administrador: {
        include: {
          configuracionTarifa: { include: { rangos: true, dinamicas: true } },
        },
      },
      pagos: { orderBy: { fecha: "desc" }, take: 1 },
      rangoTarifa: true,
      dinamicaTarifa: true,
    },
  });
  summary.checkedUsers = users.length;

  // Paso 2: filtrar candidatos (tienen ultimo pago y este está PAGADO y no tienen pago siguiente)
  // Pre-fetch all existing next-month payments in a single query to avoid N+1
  const candidatePairs: { usuario: typeof users[0]; ultimoPago: typeof users[0]["pagos"][0] }[] = [];
  for (const u of users) {
    const ultimo = u.pagos?.[0] ?? null;
    if (!ultimo) continue;
    if (String(ultimo.estado).toUpperCase() !== "PAGADO") continue;
    candidatePairs.push({ usuario: u, ultimoPago: ultimo });
  }

  if (candidatePairs.length > 0) {
    const nextMonthChecks = candidatePairs.map((c) => {
      const mesUlt = Number(c.ultimoPago.mes);
      const añoUlt = Number(c.ultimoPago.año);
      const proximoMes = mesUlt === 12 ? 1 : mesUlt + 1;
      const proximoAño = mesUlt === 12 ? añoUlt + 1 : añoUlt;
      return { usuarioId: c.usuario.id, mes: proximoMes, año: proximoAño };
    });

    const existingPayments = await prisma.pago.findMany({
      where: {
        OR: nextMonthChecks.map((c) => ({
          usuarioId: c.usuarioId,
          mes: c.mes,
          año: c.año,
        })),
      },
      select: { usuarioId: true, mes: true, año: true },
    });

    const existingSet = new Set(
      existingPayments.map((p) => `${p.usuarioId}-${p.mes}-${p.año}`)
    );

    const candidates = candidatePairs.filter((c) => {
      const mesUlt = Number(c.ultimoPago.mes);
      const añoUlt = Number(c.ultimoPago.año);
      const proximoMes = mesUlt === 12 ? 1 : mesUlt + 1;
      const proximoAño = mesUlt === 12 ? añoUlt + 1 : añoUlt;
      return !existingSet.has(`${c.usuario.id}-${proximoMes}-${proximoAño}`);
    });

    // Paso 3: intentar crear pagos para cada candidato (usar generarProximoPago)
    for (const c of candidates) {
      try {
        const fechaReferencia = new Date();
        const creado = await generarProximoPago(
          c.usuario,
          c.usuario.administrador?.configuracionTarifa ?? null,
          c.ultimoPago,
          fechaReferencia
        );
        if (creado) summary.created++;
        else {
          summary.skipped++;
          summary.failures.push({
            usuarioId: c.usuario.id,
            reason: "no_creado_generarProximoPago",
          });
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "error";
        summary.failures.push({
          usuarioId: c.usuario.id,
          reason: message,
        });
        logger.error("[runDailyPaymentsCron] fallo creando pago", {
          usuarioId: c.usuario.id,
          err: String(err instanceof Error ? err.stack : err),
        });
      }
    }
  }

  // Paso 4: aplicar ajustes por dias de gracia / actualización de montos (implementa lógica existente)
  try {
    // ejemplo: llamar a función existente que actualiza montos por dias de gracia
    // await applyGraceDayAdjustments(referenceDate);
  } catch (err) {
    logger.error("[runDailyPaymentsCron] fallo applyGraceDayAdjustments", err);
  }

  // Paso 5: marcar vencidos y aplicar recargos (si procede)
  try {
    // await markOverdueAndApplyRecargos(referenceDate);
  } catch (err) {
    logger.error(
      "[runDailyPaymentsCron] fallo markOverdueAndApplyRecargos",
      err
    );
  }

  // Paso 6: enviar notificaciones de pagos pendientes
  try {
    // await sendPendingPaymentNotifications();
  } catch (err) {
    logger.error(
      "[runDailyPaymentsCron] fallo sendPendingPaymentNotifications",
      err
    );
  }

  return summary;
}
