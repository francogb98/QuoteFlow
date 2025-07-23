"use server";

import prisma from "@/lib/prisma";
import type { FindUserResult } from "@/types/find-user-result";

// Función auxiliar para obtener el monto según el día del mes (con búsqueda del más cercano)
const getMontoByDay = (dia: number, rangos: any[]) => {
  if (!rangos || rangos.length === 0) return null;

  // Primero intentar encontrar un rango exacto
  const rangoExacto = rangos.find((r) => dia >= r.diaInicio && dia <= r.diaFin);
  if (rangoExacto) {
    return {
      monto: rangoExacto.monto,
      rango: rangoExacto,
      esExacto: true,
      mensaje: `Tarifa exacta para el día ${dia}`,
    };
  }

  // Si no encuentra exacto, buscar el más cercano
  let rangoMasCercano = null;
  let menorDistancia = Number.POSITIVE_INFINITY;
  let tipoProximidad = "";

  for (const rango of rangos) {
    let distancia = Number.POSITIVE_INFINITY;
    let tipo = "";

    if (dia < rango.diaInicio) {
      // El día está antes del rango
      distancia = rango.diaInicio - dia;
      tipo = "siguiente";
    } else if (dia > rango.diaFin) {
      // El día está después del rango
      distancia = dia - rango.diaFin;
      tipo = "anterior";
    }

    if (distancia < menorDistancia) {
      menorDistancia = distancia;
      rangoMasCercano = rango;
      tipoProximidad = tipo;
    }
  }

  if (rangoMasCercano) {
    return {
      monto: rangoMasCercano.monto,
      rango: rangoMasCercano,
      esExacto: false,
      distancia: menorDistancia,
      tipoProximidad,
      mensaje: `Tarifa más cercana (${tipoProximidad}) para el día ${dia}. Rango: ${rangoMasCercano.diaInicio}-${rangoMasCercano.diaFin}, distancia: ${menorDistancia} días`,
    };
  }

  return null;
};

// Función auxiliar para analizar y actualizar pagos
const analyzeAndUpdatePayments = async (
  usuario: any,
  configuracionTarifa: any,
  currentMonth: number,
  currentYear: number
) => {
  if (
    !configuracionTarifa ||
    !configuracionTarifa.rangos ||
    configuracionTarifa.rangos.length === 0
  ) {
    return {
      needsUpdate: false,
      message: "No hay configuración de tarifas disponible",
    };
  }

  const today = new Date();
  const currentDay = today.getDate();
  const tarifaResult = getMontoByDay(currentDay, configuracionTarifa.rangos);

  if (!tarifaResult) {
    return {
      needsUpdate: false,
      message: "No se encontró tarifa para el día actual ni rangos cercanos",
    };
  }

  const expectedMonto = tarifaResult.monto;

  // Buscar pago del mes actual
  const currentPayment = usuario.pagos.find(
    (pago: any) => pago.mes === currentMonth && pago.año === currentYear
  );

  let updateResult = null;

  if (currentPayment) {
    // Si existe el pago pero el monto es diferente, actualizarlo
    if (currentPayment.monto !== expectedMonto) {
      try {
        updateResult = await prisma.pago.update({
          where: { id: currentPayment.id },
          data: { monto: expectedMonto },
        });

        return {
          needsUpdate: true,
          message: `Monto actualizado de $${currentPayment.monto} a $${expectedMonto}. ${tarifaResult.mensaje}`,
          oldMonto: currentPayment.monto,
          newMonto: expectedMonto,
          paymentId: currentPayment.id,
          tarifaInfo: tarifaResult,
        };
      } catch (error) {
        console.error("Error actualizando pago:", error);
        return {
          needsUpdate: false,
          message: "Error al actualizar el monto del pago",
        };
      }
    } else {
      return {
        needsUpdate: false,
        message: `El monto del pago ya es correcto ($${currentPayment.monto}). ${tarifaResult.mensaje}`,
        currentMonto: currentPayment.monto,
        tarifaInfo: tarifaResult,
      };
    }
  } else {
    // Si no existe pago para el mes actual, crearlo
    try {
      const fechaPago = new Date(currentYear, currentMonth - 1, 1);
      const periodo = `${currentMonth
        .toString()
        .padStart(2, "0")}/${currentYear}`;

      updateResult = await prisma.pago.create({
        data: {
          usuarioId: usuario.id,
          monto: expectedMonto,
          mes: currentMonth,
          año: currentYear,
          fecha: fechaPago,
          periodo: periodo,
          estado: "PENDIENTE",
          metodo: "EFECTIVO",
          estaVencido: false,
        },
      });

      return {
        needsUpdate: true,
        message: `Pago creado para ${currentMonth}/${currentYear} con monto $${expectedMonto}. ${tarifaResult.mensaje}`,
        newMonto: expectedMonto,
        paymentId: updateResult.id,
        isNewPayment: true,
        tarifaInfo: tarifaResult,
      };
    } catch (error) {
      console.error("Error creando pago:", error);
      return {
        needsUpdate: false,
        message: "Error al crear el pago del mes actual",
      };
    }
  }
};

export const findUser = async (
  documento: string,
  empresa: string
): Promise<FindUserResult> => {
  console.log("findUser", documento, empresa);
  try {
    // Buscar empresa con sus datos nuevos
    const empresaExist = await prisma.empresa.findUnique({
      where: { nombre: empresa },
      include: {
        administradores: {
          where: { estaActivo: true },
          include: {
            configuracionTarifa: {
              include: {
                rangos: true,
              },
            },
          },
        },
      },
    });

    if (!empresaExist || empresaExist.administradores.length === 0) {
      return {
        ok: false,
        message:
          "No se encontró la empresa o no tiene administradores activos.",
      };
    }

    const admin = empresaExist.administradores[0];

    const usuario = await prisma.usuario.findFirst({
      where: {
        documento,
        administradorId: admin.id,
      },
      include: {
        pagos: {
          orderBy: { fecha: "desc" },
        },
      },
    });

    if (!usuario) {
      return {
        ok: false,
        message: "No se encontró el usuario.",
      };
    }

    // Analizar y actualizar pagos según tarifas
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const paymentAnalysis = await analyzeAndUpdatePayments(
      usuario,
      admin.configuracionTarifa,
      currentMonth,
      currentYear
    );

    // Si se actualizó algo, volver a buscar el usuario para obtener datos frescos
    let updatedUsuario = usuario;
    if (paymentAnalysis.needsUpdate) {
      //@ts-ignore
      updatedUsuario = await prisma.usuario.findFirst({
        where: {
          documento,
          administradorId: admin.id,
        },
        include: {
          pagos: {
            orderBy: { fecha: "desc" },
          },
        },
      });
    }

    return {
      ok: true,
      id: updatedUsuario!.id,
      administradorId: admin.id,
      usuario: updatedUsuario!,
      configuracionTarifa: admin.configuracionTarifa,
      empresa: {
        id: empresaExist.id,
        nombre: empresaExist.nombre,
        planTipo: empresaExist.planTipo,
        estadoPago: empresaExist.estadoPago,
        frecuenciaPago: empresaExist.frecuenciaPago,
        fechaUltimoPago: empresaExist.fechaUltimoPago,
        fechaProximoVencimiento: empresaExist.fechaProximoVencimiento,
        estaActiva: empresaExist.estaActiva,
      },
      paymentAnalysis, // Información sobre los cambios realizados
    };
  } catch (error) {
    console.error("Error al buscar usuario:", error);
    return {
      ok: false,
      message: "Error al buscar usuario.",
    };
  }
};
