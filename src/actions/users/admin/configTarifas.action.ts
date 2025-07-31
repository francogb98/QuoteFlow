"use server";

import { auth } from "@/*";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { TipoConfiguracionTarifa } from "@prisma/client";

interface SaveTariffConfigData {
  tipoConfiguracion: TipoConfiguracionTarifa;
  rangos?: Array<{
    id?: string;
    diaInicio: number;
    diaFin: number;
    monto: number;
  }>;
  montoBase?: number;
  diasGracia?: number;
  montoRecargo?: number;
  estaActiva?: boolean;
}

export async function saveTariffConfiguration(data: SaveTariffConfigData) {
  try {
    const session = await auth();
    if (!session?.user) {
      return {
        ok: false,
        message: "No estás logueado",
      };
    }

    const { id: administradorId } = session.user;
    if (!administradorId) {
      return {
        ok: false,
        message: "No se pudo obtener el ID del administrador",
      };
    }

    const {
      tipoConfiguracion,
      rangos,
      montoBase,
      diasGracia,
      montoRecargo,
      estaActiva = true,
    } = data;

    const existingConfig = await prisma.configuracionTarifa.findUnique({
      where: { administradorId },
      include: { rangos: true },
    });

    let updatedConfig;

    if (tipoConfiguracion === TipoConfiguracionTarifa.FIJA_MENSUAL) {
      // Validar solapamiento solo para tarifas fijas mensuales
      if (rangos) {
        for (let i = 0; i < rangos.length; i++) {
          for (let j = i + 1; j < rangos.length; j++) {
            const rangoA = rangos[i];
            const rangoB = rangos[j];
            if (
              rangoA.diaInicio <= rangoB.diaFin &&
              rangoA.diaFin >= rangoB.diaInicio
            ) {
              return {
                ok: false,
                message: `Los rangos ${rangoA.diaInicio}-${rangoA.diaFin} y ${rangoB.diaInicio}-${rangoB.diaFin} se superponen.`,
              };
            }
          }
        }
      }

      if (!existingConfig) {
        // Crear nueva configuración y rangos
        updatedConfig = await prisma.configuracionTarifa.create({
          data: {
            administradorId,
            tipoConfiguracion,
            estaActiva,
            rangos: {
              createMany: {
                data: rangos?.map(({ id, ...rango }) => rango) || [], // Excluir el ID temporal
              },
            },
          },
          include: { rangos: true },
        });
      } else {
        // Actualizar configuración existente y sus rangos

        // Obtener los IDs reales de los rangos existentes en la base de datos
        const existingRangoIds = existingConfig.rangos.map((r) => r.id);

        // Separar rangos para actualizar (tienen ID real) y crear (no tienen ID real o tienen ID temporal)
        const rangosToUpdate =
          rangos?.filter((r) => r.id && existingRangoIds.includes(r.id)) || [];
        const rangosToCreate =
          rangos?.filter((r) => !r.id || !existingRangoIds.includes(r.id!)) ||
          [];

        // Encontrar rangos a eliminar (existen en BD pero no en la nueva lista)
        const newRangoIds = rangosToUpdate.map((r) => r.id);
        const rangosToDelete = existingConfig.rangos.filter(
          (oldRango) => !newRangoIds.includes(oldRango.id)
        );

        // Eliminar rangos que ya no están en la nueva lista
        if (rangosToDelete.length > 0) {
          await prisma.rangoTarifa.deleteMany({
            where: {
              id: {
                in: rangosToDelete.map((r) => r.id),
              },
            },
          });
        }

        // Actualizar rangos existentes
        for (const rango of rangosToUpdate) {
          await prisma.rangoTarifa.update({
            where: { id: rango.id },
            data: {
              diaInicio: rango.diaInicio,
              diaFin: rango.diaFin,
              monto: rango.monto,
            },
          });
        }

        // Crear nuevos rangos
        if (rangosToCreate.length > 0) {
          await prisma.rangoTarifa.createMany({
            data: rangosToCreate.map(({ id, ...rango }) => ({
              ...rango,
              configuracionTarifaId: existingConfig.id,
            })),
          });
        }

        // Actualizar la configuración principal
        updatedConfig = await prisma.configuracionTarifa.update({
          where: { id: existingConfig.id },
          data: {
            tipoConfiguracion,
            montoBase: null, // Limpiar campos de tarifa dinámica
            diasGracia: null,
            montoRecargo: null,
            estaActiva,
          },
          include: { rangos: true },
        });
      }
    } else if (
      tipoConfiguracion === TipoConfiguracionTarifa.DINAMICA_POR_FECHA_INGRESO
    ) {
      if (
        montoBase === undefined ||
        diasGracia === undefined ||
        montoRecargo === undefined
      ) {
        return {
          ok: false,
          message: "Todos los campos de tarifa dinámica son requeridos.",
        };
      }

      if (!existingConfig) {
        // Crear nueva configuración dinámica
        updatedConfig = await prisma.configuracionTarifa.create({
          data: {
            administradorId,
            tipoConfiguracion,
            montoBase,
            diasGracia,
            montoRecargo,
            estaActiva,
          },
        });
      } else {
        // Actualizar configuración existente a dinámica
        // Eliminar rangos existentes si cambia de FIJA_MENSUAL a DINAMICA
        if (
          existingConfig.tipoConfiguracion ===
          TipoConfiguracionTarifa.FIJA_MENSUAL
        ) {
          await prisma.rangoTarifa.deleteMany({
            where: { configuracionTarifaId: existingConfig.id },
          });
        }

        updatedConfig = await prisma.configuracionTarifa.update({
          where: { id: existingConfig.id },
          data: {
            tipoConfiguracion,
            montoBase,
            diasGracia,
            montoRecargo,
            estaActiva,
          },
        });
      }
    } else {
      return {
        ok: false,
        message: "Tipo de configuración de tarifa no válido.",
      };
    }

    revalidatePath("/configuraciones");
    return {
      ok: true,
      message: "Configuración de tarifas guardada exitosamente",
      configuracion: updatedConfig,
    };
  } catch (error) {
    console.error("Error al guardar configuración de tarifas:", error);
    return {
      ok: false,
      message: "Error al guardar la configuración",
      error: (error as Error).message,
    };
  }
}

export async function updateRangoTarifas(data: any) {
  try {
    const { configuracionTarifaId, monto, diaInicio, diaFin, tarifaId } = data;

    // Obtener todos los rangos actuales excepto el que se va a actualizar
    const configuracion = await prisma.configuracionTarifa.findUnique({
      where: { id: configuracionTarifaId },
      include: { rangos: true },
    });

    if (!configuracion) {
      return { ok: false, message: "No se encontró la configuración" };
    }

    const solapado = configuracion.rangos.some(
      (rango) =>
        rango.id !== tarifaId &&
        diaInicio <= rango.diaFin &&
        diaFin >= rango.diaInicio
    );

    if (solapado) {
      return {
        ok: false,
        message: "El nuevo rango se superpone con uno existente",
      };
    }

    await prisma.rangoTarifa.updateMany({
      where: { configuracionTarifaId, id: tarifaId },
      data: {
        monto: +monto,
        diaInicio: +diaInicio,
        diaFin: +diaFin,
      },
    });

    revalidatePath("/configuraciones");
    return { ok: true, message: "Tarifas actualizadas exitosamente" };
  } catch (error) {
    console.error("Error al actualizar tarifas:", error);
    return { ok: false, message: "Error al obtener las tarifas" };
  }
}
