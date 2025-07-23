import { auth } from "@/*";

import { CrearTarifas } from "./CrearTarifas";
import { TariffTable } from "./TariffTable ";
import {
  AlertTriangle,
  CreditCard,
  ExternalLink,
  InfoIcon,
} from "lucide-react";

//https://www.mercadopago.com.ar/costs-section/merchant-svcs/processing/options

export const TariffDashboard = async () => {
  const session = await auth();

  const hasTarifas =
    //@ts-ignore
    session?.user.configuracionTarifa?.rangos?.length > 0;

  const tarifas = hasTarifas
    ? //@ts-ignore
      session.user.configuracionTarifa.rangos.sort(
        (a: any, b: any) => a.diaInicio - b.diaInicio
      )
    : [];

  return (
    <div className="flex flex-col gap-5">
      <h1 className="capitalize mb-3 text-2xl font-bold bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent">
        Tus Tarifas
      </h1>
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <InfoIcon className="w-5 h-5 text-blue-600" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">
                Información sobre comisiones
              </h3>
            </div>

            <p className="text-blue-800 text-sm sm:text-base mb-4 leading-relaxed">
              <strong>Importante:</strong> MercadoPago cobra una comisión por
              cada transacción procesada. Las tarifas que configures aquí son
              adicionales a las comisiones de MercadoPago.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://www.mercadopago.com.ar/costs-section/merchant-svcs/processing/options"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                <ExternalLink className="w-4 h-4" />
                Ver comisiones de MercadoPago
              </a>

              <div className="flex items-center gap-2 text-blue-700 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Consulta las tarifas oficiales antes de configurar</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {hasTarifas && (
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-purple-100 p-4">
          <TariffTable tarifas={tarifas} />
        </div>
      )}

      {
        // @ts-ignore
        !hasTarifas && (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-purple-100 p-4">
            <p className="text-gray-600">No tienes tarifas configuradas</p>
          </div>
        )
      }
      <div>
        <h1 className="capitalize mb-3 text-2xl font-bold bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent">
          Nueva Tarifa
        </h1>
        <CrearTarifas />
      </div>
    </div>
  );
};
