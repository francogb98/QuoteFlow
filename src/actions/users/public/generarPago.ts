"use server";

import prisma from "@/lib/prisma";
import { TipoConfiguracionTarifa, $Enums } from "@prisma/client";

export async function generarPagoMensual(usuarioId: string) {
  try {
    const ahora = new Date();
    const mesActual = ahora.getMonth() + 1; // 1-12
    const añoActual = ahora.getFullYear();
    const periodoActual = `${añoActual}-${String(mesActual).padStart(2, "0")}`;

    // Calcular tarifa
    const { monto, fechaVencimiento } = await calcularTarifa(usuarioId);

    // Verificar si ya existe un pago para este mes
    const pagoExistente = await prisma.pago.findFirst({
      where: {
        usuarioId,
        periodo: periodoActual,
      },
    });

    if (pagoExistente) {
      await prisma.pago.delete({ where: { id: pagoExistente.id } });
    }

    const pago = await prisma.pago.create({
      data: {
        monto,
        mes: mesActual,
        año: añoActual,
        periodo: periodoActual,
        usuarioId,
        estado: $Enums.EstadoPago.PENDIENTE,
        estaVencido: false,
        fechaVencimiento: fechaVencimiento || null,
      },
    });

    return pago;
  } catch (error) {
    console.error("Error al generar el pago:", error);
    throw error;
  }
}

async function calcularTarifa(
  usuarioId: string
): Promise<{ monto: number; fechaVencimiento?: Date }> {
  // 1. Obtener usuario y administradores vinculados
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: { administradorId: true },
  });

  if (!usuario) throw new Error("Usuario no encontrado");

  // 2. Obtener configuración activa donde el admin esté incluido
  const configTarifa = await prisma.configuracionTarifa.findFirst({
    where: {
      administradores: { some: { id: usuario.administradorId } },
      estaActiva: true,
    },
    include: {
      rangos: { orderBy: { diaInicio: "asc" } },
      dinamicas: true,
    },
  });

  if (!configTarifa)
    throw new Error(
      "No hay configuración de tarifas activa para este administrador"
    );

  const diaActual = new Date().getDate();

  // 3. Calcular según tipo de configuración
  if (configTarifa.tipoConfiguracion === TipoConfiguracionTarifa.FIJA_MENSUAL) {
    let tarifaAplicable = 0;
    let rangoEncontrado = null;

    for (const rango of configTarifa.rangos) {
      if (diaActual >= rango.diaInicio && diaActual <= rango.diaFin) {
        tarifaAplicable = rango.monto;
        rangoEncontrado = rango;
        break;
      }
    }

    if (!rangoEncontrado) {
      const ultimoRango = configTarifa.rangos[configTarifa.rangos.length - 1];
      tarifaAplicable = ultimoRango.monto;
      console.warn(
        `Día ${diaActual} fuera de rangos definidos. Aplicando tarifa del último rango.`
      );
    }

    return { monto: tarifaAplicable };
  } else if (
    configTarifa.tipoConfiguracion ===
    TipoConfiguracionTarifa.DINAMICA_POR_FECHA_INGRESO
  ) {
    // Para sistema dinámico, tomar la primera configuración dinámica (puedes ajustar la lógica según reglas de negocio)
    if (!configTarifa.dinamicas || configTarifa.dinamicas.length === 0) {
      throw new Error("No hay tarifas dinámicas definidas.");
    }

    const dinamica = configTarifa.dinamicas[0]; // podrías aplicar reglas más complejas según días de gracia
    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaVencimiento.getDate() + dinamica.diasGracia);

    return { monto: dinamica.montoBase, fechaVencimiento };
  } else {
    throw new Error("Tipo de configuración de tarifa no válido.");
  }
}
