"use server";

import prisma from "@/lib/prisma";

export async function generarPagoMensual(usuarioId: string) {
  try {
    const ahora = new Date();
    const mesActual = ahora.getMonth() + 1; // 1-12
    const añoActual = ahora.getFullYear();
    const periodoActual = `${añoActual}-${String(mesActual).padStart(2, "0")}`;

    // Verificar si ya existe un pago para este mes
    const tarifa = await calcularTarifa(usuarioId);

    const pagoExistente = await prisma.pago.findFirst({
      where: {
        usuarioId,
        periodo: periodoActual,
      },
    });

    //borrar pago si existe
    if (pagoExistente) {
      await prisma.pago.delete({
        where: {
          id: pagoExistente.id,
        },
      });
    }

    const pago = await prisma.pago.create({
      data: {
        monto: tarifa,
        mes: mesActual,
        año: añoActual,
        periodo: periodoActual,
        usuarioId,
        estado: "PENDIENTE",
        estaVencido: false,
      },
    });

    return pago;
  } catch (error) {
    console.error("Error al generar el pago:", error);
    throw error;
  }
}

async function calcularTarifa(usuarioId: string): Promise<number> {
  // 1. Obtener el usuario para verificar si tiene alguna configuración especial
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: { administradorId: true },
  });

  if (!usuario) {
    throw new Error("Usuario no encontrado");
  }

  // 2. Obtener la configuración de tarifas del administrador
  const configTarifa = await prisma.configuracionTarifa.findFirst({
    where: {
      administradorId: usuario.administradorId,
      estaActiva: true,
    },
    include: {
      rangos: {
        orderBy: {
          diaInicio: "asc", // Ordenamos los rangos por día de inicio
        },
      },
    },
  });

  if (!configTarifa || configTarifa.rangos.length === 0) {
    throw new Error(
      "No hay configuración de tarifas activa para este administrador"
    );
  }

  // 3. Obtener el día actual del mes (1-31)
  const diaActual = new Date().getDate();

  // 4. Buscar el rango que corresponde al día actual
  let tarifaAplicable = 0;
  let rangoEncontrado = null;

  // Recorremos los rangos ordenados para encontrar el correspondiente
  for (const rango of configTarifa.rangos) {
    if (diaActual >= rango.diaInicio && diaActual <= rango.diaFin) {
      tarifaAplicable = rango.monto;
      rangoEncontrado = rango;
      break;
    }
  }

  // 5. Si no encontramos rango (puede ser día fuera de rangos), usamos el último rango
  if (!rangoEncontrado) {
    const ultimoRango = configTarifa.rangos[configTarifa.rangos.length - 1];
    tarifaAplicable = ultimoRango.monto;
    console.warn(
      `Día ${diaActual} fuera de rangos definidos. Aplicando tarifa del último rango.`
    );
  }

  return tarifaAplicable;
}
