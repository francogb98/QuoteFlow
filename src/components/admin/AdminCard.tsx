"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCheck, UserX, Loader2 } from "lucide-react";
import type { AdminListItem } from "@/actions/users/admin/getAdmins";
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
        queryClient.invalidateQueries({ queryKey: ["admins"] });
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
    <Card className="w-[300px] shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-card-foreground">
          {admin.nombre}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-card-foreground">
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
          <Badge variant={admin.estaActivo ? "default" : "destructive"}>
            {admin.estaActivo ? "Activo" : "Inactivo"}
          </Badge>
        </p>
        <div className="pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleStatus}
            disabled={toggleStatusMutation.isPending}
            className={`w-full transition-colors duration-200`}
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
