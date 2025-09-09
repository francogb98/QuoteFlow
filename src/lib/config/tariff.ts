"use server";

import prisma from "@/lib/prisma";
import { TipoConfiguracionTarifa } from "@prisma/client";

interface RangoTarifaInput {
  id?: string;
  nombre: string;
  diaInicio: number;
  diaFin: number;
  monto: number;
}

interface DinamicaTarifaInput {
  id?: string;
  nombre: string;
  montoBase: number;
  diasGracia: number;
  montoRecargo: number;
}

interface UpdateTariffConfigDetailsData {
  administradorId: string;
  tipoConfiguracion: TipoConfiguracionTarifa;
  rangos?: RangoTarifaInput[];
  dinamicas?: DinamicaTarifaInput[];
  estaActiva?: boolean;
}

export async function updateTariffConfigurationDetails(
  data: UpdateTariffConfigDetailsData
) {
  const {
    administradorId,
    tipoConfiguracion,
    rangos,
    dinamicas,
    estaActiva = true,
  } = data;

  // Buscar configuración existente donde el admin esté incluido
  const existingConfig = await prisma.configuracionTarifa.findFirst({
    where: { administradores: { some: { id: administradorId } } },
    include: { rangos: true, dinamicas: true, administradores: true },
  });

  let updatedConfig;

  if (tipoConfiguracion === TipoConfiguracionTarifa.FIJA_MENSUAL) {
    // Validar rangos superpuestos
    if (rangos) {
      for (let i = 0; i < rangos.length; i++) {
        for (let j = i + 1; j < rangos.length; j++) {
          const a = rangos[i];
          const b = rangos[j];
          if (a.diaInicio <= b.diaFin && a.diaFin >= b.diaInicio) {
            throw new Error(`Los rangos ${a.nombre} se superponen.`);
          }
        }
      }
    }

    if (!existingConfig) {
      // Crear nueva configuración y conectar al administrador
      updatedConfig = await prisma.configuracionTarifa.create({
        data: {
          tipoConfiguracion,
          estaActiva,
          rangos: {
            create:
              rangos?.map((r) => ({
                nombre: r.nombre,
                diaInicio: r.diaInicio,
                diaFin: r.diaFin,
                monto: r.monto,
              })) || [],
          },
          administradores: { connect: [{ id: administradorId }] },
        },
        include: { rangos: true, administradores: true },
      });
    } else {
      // Actualizar rangos existentes
      const newRangoIds = rangos?.filter((r) => r.id).map((r) => r.id!) || [];
      await prisma.rangoTarifa.deleteMany({
        where: {
          configuracionTarifaId: existingConfig.id,
          id: { notIn: newRangoIds },
        },
      });

      for (const rango of rangos || []) {
        if (rango.id) {
          await prisma.rangoTarifa.update({
            where: { id: rango.id },
            data: {
              nombre: rango.nombre,
              diaInicio: rango.diaInicio,
              diaFin: rango.diaFin,
              monto: rango.monto,
            },
          });
        } else {
          await prisma.rangoTarifa.create({
            data: {
              nombre: rango.nombre,
              diaInicio: rango.diaInicio,
              diaFin: rango.diaFin,
              monto: rango.monto,
              configuracionTarifaId: existingConfig.id,
            },
          });
        }
      }

      // Aseguramos que el administrador esté conectado
      updatedConfig = await prisma.configuracionTarifa.update({
        where: { id: existingConfig.id },
        data: {
          tipoConfiguracion,
          estaActiva,
          administradores: { connect: [{ id: administradorId }] },
        },
        include: { rangos: true, administradores: true },
      });
    }
  } else if (
    tipoConfiguracion === TipoConfiguracionTarifa.DINAMICA_POR_FECHA_INGRESO
  ) {
    if (!dinamicas || dinamicas.length === 0) {
      throw new Error("Debe incluir al menos una tarifa dinámica.");
    }

    if (!existingConfig) {
      // Crear nueva configuración dinámica y conectar admin
      updatedConfig = await prisma.configuracionTarifa.create({
        data: {
          tipoConfiguracion,
          estaActiva,
          dinamicas: {
            create: dinamicas.map((d) => ({
              nombre: d.nombre,
              montoBase: d.montoBase,
              diasGracia: d.diasGracia,
              montoRecargo: d.montoRecargo,
            })),
          },
          administradores: { connect: [{ id: administradorId }] },
        },
        include: { dinamicas: true, administradores: true },
      });
    } else {
      // Si cambiamos de FIJA a DINAMICA, eliminar rangos antiguos
      if (
        existingConfig.tipoConfiguracion ===
        TipoConfiguracionTarifa.FIJA_MENSUAL
      ) {
        await prisma.rangoTarifa.deleteMany({
          where: { configuracionTarifaId: existingConfig.id },
        });
      }

      const newDinamicaIds = dinamicas.filter((d) => d.id).map((d) => d.id!);
      await prisma.configuracionDinamicaTarifa.deleteMany({
        where: {
          configuracionTarifaId: existingConfig.id,
          id: { notIn: newDinamicaIds },
        },
      });

      for (const dinamica of dinamicas) {
        if (dinamica.id) {
          await prisma.configuracionDinamicaTarifa.update({
            where: { id: dinamica.id },
            data: {
              nombre: dinamica.nombre,
              montoBase: dinamica.montoBase,
              diasGracia: dinamica.diasGracia,
              montoRecargo: dinamica.montoRecargo,
            },
          });
        } else {
          await prisma.configuracionDinamicaTarifa.create({
            data: {
              nombre: dinamica.nombre,
              montoBase: dinamica.montoBase,
              diasGracia: dinamica.diasGracia,
              montoRecargo: dinamica.montoRecargo,
              configuracionTarifaId: existingConfig.id,
            },
          });
        }
      }

      // Aseguramos que el administrador esté conectado
      updatedConfig = await prisma.configuracionTarifa.update({
        where: { id: existingConfig.id },
        data: {
          tipoConfiguracion,
          estaActiva,
          administradores: { connect: [{ id: administradorId }] },
        },
        include: { dinamicas: true, administradores: true },
      });
    }
  } else {
    throw new Error("Tipo de configuración de tarifa no válido.");
  }

  return updatedConfig;
}
