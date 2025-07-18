"use client";

import { useQuery } from "@tanstack/react-query";
import { TablaUsuarios } from "./TablaUsuarios";
import { getUsersList } from "@/actions/users/admin/getUsersList";
import { useState, useMemo } from "react"; // Importa useMemo
import { Switch } from "@/components/ui/switch"; // Asumo que tienes un componente Switch de shadcn/ui
import { Label } from "@/components/ui/label"; // Asumo que tienes un componente Label de shadcn/ui

// Define el tipo esperado para los datos del administrador
type AdminData = {
  usuarios: any[]; // Mantener any[] por simplicidad, o definir un tipo más preciso si es necesario
  configuracionTarifa: any; // Mantener any por simplicidad
};

const meses = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export const Lista = () => {
  const [filterByMonth, setFilterByMonth] = useState(true); // Estado para el toggle
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(
    currentDate.getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    currentDate.getFullYear()
  );

  const years = useMemo(() => {
    const now = new Date();
    const yearsArray: number[] = [];
    for (let i = now.getFullYear() - 5; i <= now.getFullYear() + 1; i++) {
      yearsArray.push(i);
    }
    return yearsArray.sort((a, b) => b - a);
  }, []);

  const { data, isPending, isError, error } = useQuery<AdminData>({
    queryKey: ["usuarios", filterByMonth, selectedMonth, selectedYear], // Añade dependencias a la queryKey

    //@ts-ignore
    queryFn: () => getUsersList(filterByMonth, selectedMonth, selectedYear), // Pasa los parámetros
  });

  if (isPending) return <div>Cargando información de usuarios...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-2">
          <Switch
            id="filter-by-month"
            checked={filterByMonth}
            onCheckedChange={setFilterByMonth}
          />
          <Label htmlFor="filter-by-month">Filtrar por mes actual</Label>
        </div>

        {filterByMonth && (
          <div className="flex gap-2">
            {/* Selector de Mes */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="p-2 border border-gray-300 rounded-md text-sm"
            >
              {meses.map((mes, index) => (
                <option key={mes} value={index + 1}>
                  {mes}
                </option>
              ))}
            </select>
            {/* Selector de Año */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="p-2 border border-gray-300 rounded-md text-sm"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* @ts-ignore */}
      {!data?.usuarios?.length && (
        <div className="text-center py-8 text-gray-500">
          No hay usuarios{" "}
          {filterByMonth ? "con pagos para el mes seleccionado" : ""}
        </div>
      )}
      {/* @ts-ignore */}
      {data?.usuarios && <TablaUsuarios usuarios={data.usuarios} />}
    </div>
  );
};
