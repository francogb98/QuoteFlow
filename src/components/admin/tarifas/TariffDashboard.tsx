"use client";

import { CreditCard, Hourglass } from "lucide-react";
import { TipoConfiguracionTarifa } from "@prisma/client";
import { TariffTable } from "./TariffTable";

interface TariffDashboardProps {
  user: any;
}

export function TariffDashboard({ user }: TariffDashboardProps) {
  const configuracionTarifa = user?.configuracionTarifa as
    | {
        tipoConfiguracion: TipoConfiguracionTarifa;
        rangos?: Array<any>;
        dinamicas?: Array<{
          id: string;
          nombre: string;
          montoBase: number;
          diasGracia: number;
          montoRecargo: number;
        }>;
      }
    | undefined;

  const hasConfiguracion = !!configuracionTarifa;
  const isFijaMensual =
    configuracionTarifa?.tipoConfiguracion ===
    TipoConfiguracionTarifa.FIJA_MENSUAL;
  const isDinamicaPorFechaIngreso =
    configuracionTarifa?.tipoConfiguracion ===
    TipoConfiguracionTarifa.DINAMICA_POR_FECHA_INGRESO;

  let tarifasFijas = isFijaMensual
    ? configuracionTarifa?.rangos?.sort((a, b) => a.diaInicio - b.diaInicio) ||
      []
    : [];

  const tarifasDinamicas = isDinamicaPorFechaIngreso
    ? configuracionTarifa?.dinamicas || []
    : [];

  if (tarifasFijas.length > 0) {
    tarifasFijas = tarifasFijas.sort((a: any, b: any) => {
      return a.nombre.localeCompare(b.nombre);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      {hasConfiguracion ? (
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-purple-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Configuración Actual
          </h2>

          {isFijaMensual && (
            <>
              <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-800 font-medium">
                  Tipo de Tarifa: Fija Mensual (por rangos de días)
                </p>
              </div>
              {tarifasFijas.length > 0 ? (
                <TariffTable tarifas={tarifasFijas} />
              ) : (
                <p className="text-gray-600">
                  No hay rangos de tarifas configurados para este tipo.
                </p>
              )}
            </>
          )}

          {isDinamicaPorFechaIngreso && (
            <>
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-800 font-medium">
                  Tipo de Tarifa: Dinámica por Fecha de Ingreso
                </p>
              </div>
              {tarifasDinamicas.length > 0 ? (
                <div className="space-y-4">
                  {tarifasDinamicas.map((dinamica) => (
                    <div
                      key={dinamica.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        {dinamica.nombre}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                          <p className="text-sm text-gray-600 mb-1">
                            Monto Base
                          </p>
                          <p className="text-2xl font-bold text-gray-800">
                            ${dinamica.montoBase.toFixed(2)}
                          </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                          <p className="text-sm text-gray-600 mb-1">
                            Días de Gracia
                          </p>
                          <p className="text-2xl font-bold text-gray-800">
                            {dinamica.diasGracia} días
                          </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                          <p className="text-sm text-gray-600 mb-1">
                            Monto con Recargo
                          </p>
                          <p className="text-2xl font-bold text-gray-800">
                            ${dinamica.montoRecargo.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">
                  No hay configuraciones dinámicas creadas para este tipo.
                </p>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-purple-100 p-6 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Sin configuración de tarifas
          </h3>
          <p className="text-gray-600">
            No tienes ninguna configuración de tarifas activa. Crea una para
            comenzar.
          </p>
        </div>
      )}
    </div>
  );
}
