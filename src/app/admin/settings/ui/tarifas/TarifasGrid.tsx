import { auth } from "@/*";

import { CrearTarifas } from "./CrearTarifas";
import { ConfigTarfas } from "./ConfigTarifa";

export const TarifasGrid = async () => {
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
      <h1 className="text-3xl font-bold capitalize">Tus Tarifas</h1>

      {hasTarifas && (
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-purple-100 p-4">
          <ConfigTarfas tarifas={tarifas} />
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
        <h1 className="text-2xl font-bold capitalize mb-3">Nueva Tarifa</h1>
        <CrearTarifas />
      </div>
    </div>
  );
};
