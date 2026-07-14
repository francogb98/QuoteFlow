"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminsByCompany } from "@/actions/users/admin/getAdmins";
import { AlertCircle } from "lucide-react";
import { AdminCard } from "./AdminCard";
import { Spinner } from "@/components/ui/spinner";
import { Alert } from "@/components/ui/alert";

export function AdminList() {
  const {
    data: adminsData,
    isLoading: isLoadingAdmins,
    isError: isErrorAdmins,
    error: adminsError,
  } = useQuery({
    queryKey: ["admins"],
    queryFn: getAdminsByCompany,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="w-full bg-card/80 backdrop-blur-md shadow-2xl rounded-2xl p-8 border border-border">
      <h2 className="text-2xl font-bold text-primary mb-6 text-center">
        Administradores de tu Empresa
      </h2>

      {isLoadingAdmins ? (
        <div className="flex justify-center items-center h-24">
          <Spinner />
          <span className="ml-2 text-muted-foreground">
            Cargando administradores...
          </span>
        </div>
      ) : isErrorAdmins ? (
        <Alert variant="destructive" className="flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-sm">
            Error al cargar administradores: {adminsError?.message}
          </span>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminsData?.admins && adminsData.admins.length > 0 ? (
            adminsData.admins.map((admin) => (
              <AdminCard key={admin.id} admin={admin} />
            ))
          ) : (
            <p className="col-span-full text-center text-muted-foreground">
              No hay otros administradores registrados en tu empresa.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
