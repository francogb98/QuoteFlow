"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminsByCompany } from "@/actions/users/admin/getAdmins";
import { Loader2, AlertCircle } from "lucide-react";
import { AdminCard } from "./AdminCard"; // Importa el componente de tarjeta

export function AdminList() {
  const {
    data: adminsData,
    isLoading: isLoadingAdmins,
    isError: isErrorAdmins,
    error: adminsError,
  } = useQuery({
    queryKey: ["admins"],
    queryFn: getAdminsByCompany,
    staleTime: 5 * 60 * 1000, // Los datos se consideran "frescos" por 5 minutos
  });

  return (
    <div className="w-full bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl p-8 border border-purple-100 ">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mb-6 text-center">
        Administradores de tu Empresa
      </h2>

      {isLoadingAdmins ? (
        <div className="flex justify-center items-center h-24">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <span className="ml-2 text-gray-600">
            Cargando administradores...
          </span>
        </div>
      ) : isErrorAdmins ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-sm">
            Error al cargar administradores: {adminsError?.message}
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminsData?.admins && adminsData.admins.length > 0 ? (
            adminsData.admins.map((admin) => (
              <AdminCard key={admin.id} admin={admin} />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">
              No hay otros administradores registrados en tu empresa.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
