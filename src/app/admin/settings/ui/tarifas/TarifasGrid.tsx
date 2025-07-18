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
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-purple-100 p-4">
        {hasTarifas && <ConfigTarfas tarifas={tarifas} />}
      </div>
      <div>
        <h1 className="text-2xl font-bold capitalize mb-3">Nueva Tarifa</h1>
        <CrearTarifas />
      </div>
    </div>
  );
};
