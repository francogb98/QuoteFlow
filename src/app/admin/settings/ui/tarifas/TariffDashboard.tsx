import {
  AlertTriangle,
  CreditCard,
  ExternalLink,
  InfoIcon,
} from "lucide-react";
import { TipoConfiguracionTarifa } from "@prisma/client";
import { TariffTable } from "./TariffTable ";

interface TariffDashboardProps {
  user: any; // Ajusta el tipo según tu estructura de usuario
}

export function TariffDashboard({ user }: TariffDashboardProps) {
  const configuracionTarifa = user?.configuracionTarifa as
    | {
        tipoConfiguracion: TipoConfiguracionTarifa;
        rangos?: Array<any>;
        montoBase?: number;
        diasGracia?: number;
        montoRecargo?: number;
      }
    | undefined;

  const hasConfiguracion = !!configuracionTarifa;
  const isFijaMensual =
    configuracionTarifa?.tipoConfiguracion ===
    TipoConfiguracionTarifa.FIJA_MENSUAL;
  const isDinamicaPorFechaIngreso =
    configuracionTarifa?.tipoConfiguracion ===
    TipoConfiguracionTarifa.DINAMICA_POR_FECHA_INGRESO;

  const tarifasFijas = isFijaMensual
    ? configuracionTarifa?.rangos?.sort(
        (a: any, b: any) => a.diaInicio - b.diaInicio
      ) || []
    : [];

  return (
    <div className="flex flex-col gap-5">
      {/* Información sobre comisiones */}

      {/* Configuración actual */}
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
              <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-800 font-medium">
                  Tipo de Tarifa: Dinámica (por fecha de ingreso)
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Monto Base</p>
                  <p className="text-2xl font-bold text-gray-800">
                    ${configuracionTarifa?.montoBase?.toFixed(2) || "N/A"}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Días de Gracia</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {configuracionTarifa?.diasGracia || "N/A"} días
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">
                    Monto con Recargo
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    ${configuracionTarifa?.montoRecargo?.toFixed(2) || "N/A"}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-purple-100 p-6">
          <div className="text-center py-8">
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
        </div>
      )}
    </div>
  );
}
