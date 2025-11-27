"use server";
import prisma from "@/lib/prisma";
import { logger } from "./logger";

/**
 * Corrige pagos cuyo monto no coincide con el monto que tiene el usuario.
 * Usa el monto definido por su rango o su tarifa dinámica.
 */
export async function fixIncorrectPayments(options: {
  year: number;
  months: number[];
  adminId?: string;
  onlyPending?: boolean;
}) {
  const { year, months, adminId, onlyPending = true } = options;
  logger.info(
    `[fixIncorrectPayments] Inicio year=${year} months=${months.join(
      ","
    )} adminId=${adminId ?? "all"} onlyPending=${onlyPending}`
  );

  const where: any = {
    año: year,
    mes: { in: months },
  };
  if (onlyPending) where.estado = "PENDIENTE";
  if (adminId) {
    where.usuario = { administradorId: adminId };
  }

  // Traer pagos con usuario y datos de sus tarifas
  const pagos = await prisma.pago.findMany({
    where,
    include: {
      usuario: {
        select: {
          id: true,
          nombre: true,
          administradorId: true,
          rangoTarifa: { select: { monto: true } },
          dinamicaTarifa: { select: { montoBase: true } },
        },
      },
    },
  });

  logger.info(
    `[fixIncorrectPayments] Pagos encontrados para revisar: ${pagos.length}`
  );

  const corrections: {
    pagoId: string;
    usuarioId: string;
    adminId?: string | null;
    oldMonto: number;
    newMonto: number;
    mes: number;
    año: number;
  }[] = [];

  for (const pago of pagos) {
    try {
      const usuario = pago.usuario;
      if (!usuario) {
        logger.warn(
          `[fixIncorrectPayments] pagoId=${pago.id} sin usuario relacionado, skip`
        );
        continue;
      }

      // Determinar monto esperado: primero rangoTarifa, luego dinamicaTarifa
      let expected: number | null = null;
      if (usuario.rangoTarifa?.monto != null)
        expected = Number(usuario.rangoTarifa.monto);
      else if (usuario.dinamicaTarifa?.montoBase != null)
        expected = Number(usuario.dinamicaTarifa.montoBase);

      if (expected === null) {
        logger.debug(
          `[fixIncorrectPayments] usuario=${usuario.id} sin monto asignado en rango/dinámica, skip pagoId=${pago.id}`
        );
        continue;
      }

      const oldMonto = Number(pago.monto ?? 0);
      const newMonto = Number(expected.toFixed(2));

      // Si difiere más de centavos, corregir
      if (Math.abs(oldMonto - newMonto) > 0.009) {
        await prisma.pago.update({
          where: { id: pago.id },
          data: { monto: newMonto },
        });

        corrections.push({
          pagoId: pago.id,
          usuarioId: usuario.id,
          adminId: usuario.administradorId,
          oldMonto,
          newMonto,
          mes: pago.mes,
          año: pago.año,
        });

        logger.info(
          `[fixIncorrectPayments] ✅ Corregido pagoId=${pago.id} usuario=${usuario.nombre} (${usuario.id}) old=${oldMonto} -> new=${newMonto} periodo=${pago.mes}/${pago.año}`
        );
      } else {
        logger.debug(
          `[fixIncorrectPayments] pagoId=${pago.id} usuario=${usuario.nombre} (${usuario.id}) monto correcto (${oldMonto})`
        );
      }
    } catch (err) {
      logger.error(
        `[fixIncorrectPayments] ❌ Error procesando pagoId=${pago.id}:`,
        err
      );
    }
  }

  const summary = {
    checked: pagos.length,
    corrected: corrections.length,
    corrections,
  };

  logger.info(
    `[fixIncorrectPayments] Finalizado checked=${summary.checked} corrected=${summary.corrected}`
  );
  return summary;
}
