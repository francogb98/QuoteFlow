interface TariffTableProps {
  tarifas: Array<{
    id: string;
    nombre: string;
    diaInicio: number;
    diaFin: number;
    monto: number;
  }>;
}

export function TariffTable({ tarifas }: TariffTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-300 px-4 py-2 text-left">
              Nombre
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Día Inicio
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Día Fin
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Monto
            </th>
          </tr>
        </thead>
        <tbody>
          {tarifas.map((tarifa) => (
            <tr key={tarifa.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">
                {tarifa.nombre}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {tarifa.diaInicio}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {tarifa.diaFin}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                ${tarifa.monto.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
