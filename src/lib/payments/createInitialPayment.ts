
"use server";

import prisma from "@/lib/prisma";
import { TipoConfiguracionTarifa } from "@prisma/client";

export async function createInitialPayment({
  configuracionTarifa,
  newUser,
  primerPagoMesSiguiente,
  fechaInicioMembresia,
  selectedRangoId,
  selectedDinamicaId,
}: {
  configuracionTarifa: any;
  newUser: any;
  primerPagoMesSiguiente: boolean;
  fechaInicioMembresia: Date;
  selectedRangoId?: string;
  selectedDinamicaId?: string;
}) {
  const now = new Date();

  if (
    configuracionTarifa.tipoConfiguracion ===
    TipoConfiguracionTarifa.FIJA_MENSUAL
  ) {
    const rangoTarifa = configuracionTarifa.rangos.find(
      (r: any) => r.id === selectedRangoId
    );
    if (!rangoTarifa) {
      throw new Error("Rango de tarifa no encontrado");
    }

    const targetDate = primerPagoMesSiguiente
      ? new Date(now.getFullYear(), now.getMonth() + 1, 1)
      : new Date(now.getFullYear(), now.getMonth(), 1);

    await prisma.pago.create({
      data: {
        año: targetDate.getFullYear(),
        mes: targetDate.getMonth() + 1,
        periodo: `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, "0")}`,
        monto: rangoTarifa.monto,
        usuarioId: newUser.id,
        estaVencido: false,
        estado: "PENDIENTE",
        metodo: "EFECTIVO",
        comprobante: null,
        fecha: now,
        fechaVencimiento: null,
      },
    });
  } else if (
    configuracionTarifa.tipoConfiguracion ===
    TipoConfiguracionTarifa.DINAMICA_POR_FECHA_INGRESO
  ) {
    const dinamicaTarifa = configuracionTarifa.dinamicas.find(
      (d: any) => d.id === selectedDinamicaId
    );
    if (!dinamicaTarifa) {
      throw new Error("Configuración dinámica no encontrada");
    }

    const fechaVencimiento = new Date(fechaInicioMembresia);

    if (primerPagoMesSiguiente) {
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);
    }

    const periodo = `${fechaVencimiento.getFullYear()}-${String(fechaVencimiento.getMonth() + 1).padStart(2, "0")}`;

    await prisma.pago.create({
      data: {
        año: fechaVencimiento.getFullYear(),
        mes: fechaVencimiento.getMonth() + 1,
        periodo: periodo,
        monto: dinamicaTarifa.montoBase,
        usuarioId: newUser.id,
        estaVencido: false,
        estado: "PENDIENTE",
        metodo: "EFECTIVO",
        comprobante: null,
        fecha: now,
        fechaVencimiento: fechaVencimiento,
      },
    });
  } else {
    throw new Error("Tipo de configuración de tarifa no válido");
  }
}
