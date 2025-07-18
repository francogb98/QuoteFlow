"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCheck, UserX, Loader2 } from "lucide-react";
import type { AdminListItem } from "@/actions/users/admin/getAdmins"; // Importa el tipo
import { Rol } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleAdminStatus } from "@/actions/users/admin/toggleAdminStatus";
import { toast } from "sonner";

interface AdminCardProps {
  admin: AdminListItem;
}

export function AdminCard({ admin }: AdminCardProps) {
  const queryClient = useQueryClient();

  const toggleStatusMutation = useMutation({
    mutationFn: ({
      adminId,
      newStatus,
    }: {
      adminId: string;
      newStatus: boolean;
    }) => toggleAdminStatus(adminId, newStatus),
    onSuccess: (result) => {
      if (result?.ok) {
        toast.success(result.message || "Estado actualizado");
        queryClient.invalidateQueries({ queryKey: ["admins"] }); // Invalidar la caché para recargar la lista
      } else if (result?.error) {
        toast.error(result.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar estado");
    },
  });

  const handleToggleStatus = () => {
    toggleStatusMutation.mutate({
      adminId: admin.id,
      newStatus: !admin.estaActivo,
    });
  };

  return (
    <Card className="w-[300px] bg-white shadow-md hover:shadow-lg transition-shadow duration-200 border border-purple-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-800">
          {admin.nombre}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-gray-700">
        <p>
          <span className="font-medium">DNI:</span> {admin.documento}
        </p>
        <p>
          <span className="font-medium">Teléfono:</span> {admin.telefono}
        </p>
        <p>
          <span className="font-medium">Rol:</span>{" "}
          {admin.rol === Rol.ADMINISTRADOR
            ? "Administrador Principal"
            : "Profesor"}
        </p>
        <p>
          <span className="font-medium">Estado:</span>{" "}
          <span
            className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
              admin.estaActivo
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {admin.estaActivo ? "Activo" : "Inactivo"}
          </span>
        </p>
        <div className="pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleStatus}
            disabled={toggleStatusMutation.isPending}
            className={`w-full
              ${
                admin.estaActivo
                  ? "text-red-600 hover:bg-red-50 border-red-200"
                  : "text-green-600 hover:bg-green-50 border-green-200"
              }
              transition-colors duration-200
            `}
          >
            {toggleStatusMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Cambiando...
              </>
            ) : admin.estaActivo ? (
              <>
                <UserX className="w-4 h-4 mr-1" /> Desactivar
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4 mr-1" /> Activar
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
