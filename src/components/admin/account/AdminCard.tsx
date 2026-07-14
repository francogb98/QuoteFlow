// AdminCard.tsx
"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Rol } from "@prisma/client";

import { deleteAdmin } from "@/actions/admin/account/deleteAdmin";
import { useNotifications } from "@/components/admin/tarifas/components/use-notifications";
import Link from "next/link";

interface AdminCardProps {
  admin: {
    id: string;
    email: string;
    nombre: string;
    documento: string;
    telefono: string;
    rol: Rol;
    permitirModificarTarifa: boolean;
    permitirModificarCobro: boolean;
    modeloDeCobro: string;
    usuarios: Array<{
      id: string;
      email: string;
      nombre: string;
      documento: string;
      telefono: string;
    }>;
    configuracionTarifa: {
      id: string;
      tipoConfiguracion: string;
    } | null;
  };
  handleEdit: (admin: any) => void;
  refetchAdmins: () => void;
}

export const AdminCard = ({
  admin,
  handleEdit,
  refetchAdmins,
}: AdminCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { showSuccess, showError } = useNotifications();

  const deleteMutation = useMutation({
    mutationFn: deleteAdmin,
    onSuccess: (data) => {
      if (data.ok) {
        refetchAdmins();
        showSuccess(
          "¡Administrador eliminado!",
          "El administrador ha sido eliminado exitosamente."
        );
      } else {
        showError("Error al eliminar", data.error);
      }
    },
    onError: (error) => {
      showError("Error al eliminar", "No se pudo eliminar el administrador.");
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(admin.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div className="border border-purple-400 p-4 rounded flex flex-col justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-bold">{admin.nombre}</h2>
          <p className="text-sm text-gray-600">
            Correo: <b>{admin.email}</b>
          </p>
          <p className="text-sm text-gray-600">
            Documento: <b>{admin.documento}</b>
          </p>
          <p className="text-sm text-gray-600">
            Teléfono: <b>{admin.telefono}</b>
          </p>

          <hr />

          <p className="text-sm text-gray-600">
            Permitir modificar tarifa:{" "}
            <b>{admin.permitirModificarTarifa ? "Sí" : "No"}</b>
          </p>

          <p className="text-sm text-gray-600">
            Configuración Tarifa:{" "}
            <b className="text-[10px] lg:text-[12px]">
              {admin.configuracionTarifa?.tipoConfiguracion || "No disponible"}
            </b>
          </p>

          <hr />

          <p className="text-sm text-gray-600">
            Permitir modificar cobro:{" "}
            <b>{admin.permitirModificarCobro ? "Sí" : "No"}</b>
          </p>

          <p className="text-sm text-gray-600">
            Modelo de cobro: <b>{admin.modeloDeCobro}</b>
          </p>

          <hr />
          <p className="text-sm text-gray-600">
            Total de usuarios: <b>{admin.usuarios.length}</b>
          </p>
        </div>
        <div className="mt-4 flex flex-col gap-2 justify-start">
          <Link href={`/admin/users?profesorId=${admin.id}`} passHref>
            <Button className="w-full bg-emerald-500 hover:bg-emerald-600">
              Ver Usuarios
            </Button>
          </Link>
          <Button
            onClick={() => handleEdit(admin)}
            className="flex-1 bg-purple-500 hover:bg-purple-600"
          >
            Editar
          </Button>
          {admin.rol !== "ADMINISTRADOR" && (
            <Button
              onClick={() => setShowDeleteDialog(true)}
              disabled={deleteMutation.isPending}
              className="flex-1 bg-red-500 hover:bg-red-600"
            >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar administrador</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar a{" "}
              <span className="font-semibold">{admin.nombre}</span>? Esta acción
              no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
