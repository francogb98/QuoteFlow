"use client";

import { Label } from "@radix-ui/react-label";
import { Switch } from "@radix-ui/react-switch";
import { Calendar, Filter, Users, CalendarDays, X } from "lucide-react";

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

const getYears = () => {
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => now.getFullYear() + 1 - i);
};

interface Props {
  filterByMonth: boolean;
  setFilterByMonth: (checked: boolean) => void;
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  totalUsers?: number;
  filteredUsers?: number;
}

export const UserFilters = ({
  filterByMonth,
  selectedMonth,
  selectedYear,
  setFilterByMonth,
  setSelectedMonth,
  setSelectedYear,
  totalUsers = 0,
  filteredUsers = 0,
}: Props) => {
  const years = getYears();
  const currentMonthName = meses[selectedMonth - 1];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
      {/* Header responsive */}
      <div className="bg-gradient-to-r from-purple-50 to-emerald-50 p-4 sm:p-6 border-b border-purple-100">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Título y descripción */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2 mb-2 sm:mb-1">
              {filterByMonth ? (
                <>
                  <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                  <span className="truncate">
                    <span className="hidden sm:inline">Usuarios de </span>
                    {currentMonthName} {selectedYear}
                  </span>
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
                  <span>Todos los Usuarios</span>
                </>
              )}
            </h2>
          </div>

          {/* Toggle responsive */}
          <div
            className={`flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3 rounded-lg p-2 sm:p-3 border-2 transition-all duration-300 ${
              filterByMonth
                ? "bg-purple-50 border-purple-200"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <Filter
              className={`w-4 h-4 ${
                filterByMonth ? "text-purple-600" : "text-gray-400"
              }`}
            />
            <Switch
              id="filter-by-month"
              checked={filterByMonth}
              onCheckedChange={setFilterByMonth}
            />
            <Label
              htmlFor="filter-by-month"
              className={`text-xs sm:text-sm font-medium cursor-pointer transition-colors ${
                filterByMonth ? "text-purple-700" : "text-gray-600"
              }`}
            >
              <span className="hidden sm:inline">
                {filterByMonth ? "Filtro activo" : "Filtrar por mes"}
              </span>
              <span className="sm:hidden">
                {filterByMonth ? "Activo" : "Filtrar"}
              </span>
            </Label>
          </div>
        </div>
      </div>

      {/* Selectores de fecha responsive */}
      {filterByMonth && (
        <div className="p-4 sm:p-6 bg-gradient-to-r from-purple-50/50 to-emerald-50/50 border-b border-purple-100">
          {/* Header de la sección */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-xs sm:text-sm text-purple-600 font-medium">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Período seleccionado:</span>
              <span className="sm:hidden">Período:</span>
            </div>

            {/* Botón cerrar filtro en mobile */}
            <button
              onClick={() => setFilterByMonth(false)}
              className="sm:hidden flex items-center text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-4 h-4 mr-1" />
              Quitar
            </button>
          </div>

          {/* Selectores */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            {/* Selectores de mes y año */}
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 sm:flex-none">
                <label className="block text-xs font-medium text-gray-600 mb-1 sm:hidden">
                  Mes
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full appearance-none bg-white border-2 border-purple-200 rounded-lg px-3 sm:px-4 py-2.5 sm:py-2 pr-8 text-sm font-medium text-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-300 hover:border-purple-300"
                >
                  {meses.map((mes, index) => (
                    <option key={mes} value={index + 1}>
                      {mes}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative flex-1 sm:flex-none">
                <label className="block text-xs font-medium text-gray-600 mb-1 sm:hidden">
                  Año
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full appearance-none bg-white border-2 border-purple-200 rounded-lg px-3 sm:px-4 py-2.5 sm:py-2 pr-8 text-sm font-medium text-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-300 hover:border-purple-300"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Botón para limpiar filtro - solo desktop */}
            <button
              onClick={() => setFilterByMonth(false)}
              className="hidden sm:block ml-auto text-sm text-gray-500 hover:text-gray-700 underline transition-colors whitespace-nowrap"
            >
              Ver todos los usuarios
            </button>
          </div>
        </div>
      )}

      {/* Indicador cuando no hay filtro activo */}
      {!filterByMonth && (
        <div className="px-4 sm:px-6 py-3 bg-gray-50/50 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-600">
            <span className="text-xs sm:text-sm">
              Mostrando todos los usuarios registrados
            </span>
            <button
              onClick={() => setFilterByMonth(true)}
              className="text-purple-600 hover:text-purple-700 font-medium transition-colors text-left sm:text-right text-xs sm:text-sm"
            >
              Filtrar por período →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
