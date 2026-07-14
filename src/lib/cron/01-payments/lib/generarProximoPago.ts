"use server";
import prisma from "@/lib/prisma";
import { calculateNextPaymentDate } from "./calculations";
import { logger } from "./logger";
import type { Pago, RangoTarifa, ConfiguracionDinamicaTarifa } from "@prisma/client";

interface GenerarProximoPagoUsuario {
  id: string;
  fechaInicioMembresia?: Date | null;
  monto?: number | null;
  montoBase?: number | null;
  rangoTarifa?: Pick<RangoTarifa, "diaInicio" | "monto"> | null;
  dinamicaTarifaId?: string | null;
  dinamicaTarifa?: Pick<ConfiguracionDinamicaTarifa, "montoBase"> | null;
}

export interface GenerarProximoPagoConfiguracion {
  rangos?: Pick<RangoTarifa, "diaInicio" | "monto">[] | null;
  dinamicas?: (Pick<ConfiguracionDinamicaTarifa, "id" | "montoBase">)[] | null;
  montoDefault?: number | null;
}

interface GenerarProximoPagoPagoReferencia {
  mes?: number | null;
  año?: number | null;
  monto?: number | null;
}

export async function generarProximoPago(
  usuario: GenerarProximoPagoUsuario,
  configuracion: GenerarProximoPagoConfiguracion | null,
  pagoReferencia: GenerarProximoPagoPagoReferencia | null,
  fechaActual: Date
) {
  logger.info(`[generarProximoPago] Inicio usuario=${usuario?.id}`);

  try {
    // --- PROXIMA FECHA: preferir mes/año del pagoReferencia (evita shifts por timezone/fin de mes) ---
    let proximaFecha: Date | null = null;

    if (
      pagoReferencia &&
      Number.isFinite(Number(pagoReferencia.mes)) &&
      Number.isFinite(Number(pagoReferencia.año))
    ) {
      const mesUlt = Number(pagoReferencia.mes);
      const añoUlt = Number(pagoReferencia.año);
      const proximoMes = mesUlt === 12 ? 1 : mesUlt + 1;
      const proximoAño = mesUlt === 12 ? añoUlt + 1 : añoUlt;

      // determinar día: prioridad fechaInicioMembresia -> rangoTarifa.diaInicio -> configuracion.rangos[0].diaInicio -> 1
      let dia = 1;
      if (usuario?.fechaInicioMembresia) {
        dia = new Date(usuario.fechaInicioMembresia).getDate();
      } else if (usuario?.rangoTarifa?.diaInicio) {
        dia = Number(usuario.rangoTarifa.diaInicio);
      } else if (
        Array.isArray(configuracion?.rangos) &&
        configuracion.rangos.length > 0 &&
        configuracion.rangos[0].diaInicio
      ) {
        dia = Number(configuracion.rangos[0].diaInicio);
      }

      // capear día al máximo del mes destino
      const daysInMonth = new Date(proximoAño, proximoMes, 0).getDate();
      const dayCapped = Math.min(Math.max(1, Number(dia || 1)), daysInMonth);

      // fijar hora al mediodía para evitar shifts por timezone
      proximaFecha = new Date(proximoAño, proximoMes - 1, dayCapped, 12, 0, 0);
    } else {
      // fallback: intentar calculateNextPaymentDate, si falla usar fechaActual + 1 mes y ajustar día
      try {
        proximaFecha = calculateNextPaymentDate(pagoReferencia);
      } catch {
        proximaFecha = new Date(fechaActual);
        proximaFecha.setMonth(proximaFecha.getMonth() + 1);

        const dia =
          usuario?.rangoTarifa?.diaInicio ??
          (Array.isArray(configuracion?.rangos) &&
          configuracion.rangos.length > 0
            ? configuracion.rangos[0].diaInicio
            : 1) ??
          1;

        // capear día según mes calculado
        const daysInMonth = new Date(
          proximaFecha.getFullYear(),
          proximaFecha.getMonth() + 1,
          0
        ).getDate();
        proximaFecha.setDate(Math.min(Number(dia || 1), daysInMonth));
        proximaFecha.setHours(12, 0, 0, 0);
      }
    }

    if (!proximaFecha) {
      logger.error(
        `[generarProximoPago] No se pudo calcular proximaFecha usuario=${usuario?.id}`
      );
      return null;
    }

    const mes = proximaFecha.getMonth() + 1;
    const año = proximaFecha.getFullYear();
    const periodo = `${año}-${String(mes).padStart(2, "0")}`;

    // Evitar duplicados por mes/año o periodo
    const existing = await prisma.pago.findFirst({
      where: {
        usuarioId: usuario.id,
        OR: [{ periodo }, { mes, año }],
      },
      select: { id: true },
    });
    if (existing) {
      logger.info(
        `[generarProximoPago] skip: pago ya existe usuario=${usuario.id} periodo=${periodo} pagoId=${existing.id}`
      );
      return null;
    }

    // --- MONTO: priorizar monto del usuario; aplicar fallbacks y crear siempre (incluso 0) ---
    const toFinite = (v: unknown): number | null =>
      Number.isFinite(Number(v)) ? Number(v) : null;

    let monto: number | null =
      toFinite(usuario?.monto) ?? toFinite(usuario?.montoBase);

    if (monto === null && usuario?.dinamicaTarifa)
      monto = toFinite(usuario.dinamicaTarifa.montoBase);

    if (
      monto === null &&
      configuracion?.dinamicas &&
      usuario?.dinamicaTarifaId
    ) {
      const dyn = configuracion.dinamicas.find(
        (d) => String(d.id) === String(usuario.dinamicaTarifaId)
      );
      if (dyn) monto = toFinite(dyn.montoBase);
    }

    if (monto === null && usuario?.rangoTarifa)
      monto = toFinite(usuario.rangoTarifa.monto);
    if (
      monto === null &&
      configuracion?.rangos &&
      configuracion.rangos.length > 0
    )
      monto = toFinite(configuracion.rangos[0].monto);

    if (monto === null && pagoReferencia)
      monto = toFinite(pagoReferencia.monto);
    if (monto === null) monto = toFinite(configuracion?.montoDefault);

    if (
      monto === null &&
      configuracion?.dinamicas &&
      configuracion.dinamicas.length > 0
    )
      monto = toFinite(configuracion.dinamicas[0].montoBase);

    if (monto === null || !Number.isFinite(monto)) {
      logger.warn(
        `[generarProximoPago] monto no determinado, usando 0 como fallback usuario=${usuario?.id}`
      );
      monto = 0;
    }
    monto = Number(Number(monto).toFixed(2));

    // Crear pago
    const nuevoPago = await prisma.pago.create({
      data: {
        usuarioId: usuario.id,
        monto,
        mes,
        año,
        periodo,
        fechaVencimiento: proximaFecha,
        estado: "PENDIENTE",
      },
    });

    logger.info(
      `[generarProximoPago] Pago creado usuario=${usuario.id} pagoId=${nuevoPago.id} periodo=${periodo} monto=${monto}`
    );
    return nuevoPago;
  } catch (err) {
    logger.error(`[generarProximoPago] Error usuario=${usuario?.id}:`, err);
    return null;
  }
}
