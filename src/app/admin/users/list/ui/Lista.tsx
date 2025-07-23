"use client";

import { useQuery } from "@tanstack/react-query";
import { TablaUsuarios } from "./TablaUsuarios";
import { getUsersList } from "@/actions/users/admin/getUsersList";
import { useState, useMemo } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar, Filter, Users, Loader2, AlertCircle } from "lucide-react";

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
  const [filterByMonth, setFilterByMonth] = useState(false);
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const years = useMemo(() => {
    const now = new Date();
    const yearsArray = [];
    for (let i = now.getFullYear() - 5; i <= now.getFullYear() + 1; i++) {
      yearsArray.push(i);
    }
    return yearsArray.sort((a, b) => b - a);
  }, []);

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["usuarios"],
    queryFn: () => getUsersList(filterByMonth, selectedMonth, selectedYear),
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  if (isError) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-red-200 max-w-md mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error al cargar usuarios
            </h3>
            <p className="text-gray-600 text-sm">
              {error?.message || "Ha ocurrido un error inesperado"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con filtros */}
      <div className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-emerald-50 p-6 border-b border-purple-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Lista de Usuarios
                </h2>
                <p className="text-sm text-gray-600">
                  {data?.usuarios?.length
                    ? `${data.usuarios.length} usuarios encontrados`
                    : "Gestiona tus usuarios"}
                </p>
              </div>
            </div>

            {/* Toggle de filtro */}
            <div className="flex items-center space-x-3 bg-white rounded-lg p-3 border border-purple-200">
              <Filter className="w-4 h-4 text-purple-500" />
              <Switch
                id="filter-by-month"
                checked={filterByMonth}
                onCheckedChange={setFilterByMonth}
              />
              <Label
                htmlFor="filter-by-month"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                Filtrar por mes
              </Label>
            </div>
          </div>
        </div>

        {/* Selectores de fecha */}
        {filterByMonth && (
          <div className="p-6 bg-gradient-to-r from-purple-50/50 to-emerald-50/50 border-b border-purple-100">
            <div className="flex items-center gap-4">
              <div className="flex items-center text-sm text-gray-600 mr-4">
                <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                Filtrar por:
              </div>

              <div className="flex gap-3">
                <div className="relative">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="appearance-none bg-white border-2 border-purple-200 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-300"
                  >
                    {meses.map((mes, index) => (
                      <option key={mes} value={index + 1}>
                        {mes}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="appearance-none bg-white border-2 border-purple-200 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-300"
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Estados de carga y contenido */}
      {isPending && (
        <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Cargando usuarios...
              </h3>
              <p className="text-gray-600 text-sm">
                Esto solo tomará un momento
              </p>
            </div>
          </div>
        </div>
      )}

      {!data?.usuarios?.length && !isPending && (
        <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay usuarios
            </h3>
            <p className="text-gray-600 text-sm">
              {filterByMonth
                ? `No se encontraron usuarios con pagos para ${
                    meses[selectedMonth - 1]
                  } ${selectedYear}`
                : "Aún no has agregado usuarios a tu sistema"}
            </p>
          </div>
        </div>
      )}

      {data?.usuarios && data.usuarios.length > 0 && (
        <TablaUsuarios
          usuarios={data.usuarios}
          filtradoPorMes={filterByMonth}
        />
      )}
    </div>
  );
};
