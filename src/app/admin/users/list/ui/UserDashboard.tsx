"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Users, Loader2, AlertCircle } from "lucide-react";

import { getUsersList } from "@/01-actions/admin/users/getUserList";

import { TablaUsuarios } from "./TablaUsuarios";
import { UserFilters } from "./UserFilters";

export const UserDashboard = () => {
  const [filterByMonth, setFilterByMonth] = useState(false);
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["usuarios", filterByMonth, selectedMonth, selectedYear],
    queryFn: () => getUsersList(filterByMonth, selectedMonth, selectedYear),
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: true,
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
      <UserFilters
        filterByMonth={filterByMonth}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        setFilterByMonth={setFilterByMonth}
        setSelectedMonth={setSelectedMonth}
        setSelectedYear={setSelectedYear}
      />

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
                ? `No se encontraron usuarios registrados `
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
