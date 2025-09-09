// AdminsGrid.tsx
"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { getAdmins } from "@/01-actions/admin/account/getAdmins";

import { AdminCard } from "./AdminCard";
import { FormCreateAdmin } from "./FormCreateAdmin";
import { FormEditAdmin } from "./FormEditAdmin";
import { PlusIcon } from "lucide-react";
import { DataTable } from "@/components/DataTable"; // Import DataTable

interface Admin {
  id: string;
  rol: string;
  // Add other relevant properties of Admin
}

export const AdminsGrid = () => {
  const [open, setOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

  const adminsQuery = useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      const result = await getAdmins();
      if (!result.ok) {
        throw new Error(result.error || "Error al cargar administradores");
      }
      return result;
    },
  });

  const admins = adminsQuery.data?.empresa?.administradores || [];

  const handleEdit = (admin: Admin) => {
    setSelectedAdmin(admin);
    setOpen(true);
  };

  const handleCreate = () => {
    setSelectedAdmin(null);
    setOpen(true);
  };

  return (
    <div className="space-y-4 flex flex-col-reverse gap-3 bg-white p-2">
      <section className="space-y-4">
        <h1 className="capitalize mb-3 text-5xl font-bold bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent text-center">
          Administradores
        </h1>
        <DataTable
          data={admins.filter((admin: any) => admin.rol !== "ADMINISTRADOR")}
          isPending={adminsQuery.isPending}
          isError={adminsQuery.isError}
          error={
            adminsQuery.error ||
            (adminsQuery.data && !adminsQuery.data.ok
              ? new Error(
                  adminsQuery.data.error || "Error al cargar administradores"
                )
              : null)
          }
          emptyMessage="No se encontraron administradores."
          renderItem={(admin: Admin) => (
            <AdminCard
              key={admin.id}
              // @ts-ignore
              admin={admin}
              handleEdit={handleEdit}
              refetchAdmins={adminsQuery.refetch}
            />
          )}
        />
      </section>
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          {admins.length <= 3 && (
            <DialogTrigger asChild>
              <Button
                className="bg-green-700 w-[200px] hover:bg-green-800 cursor-pointer"
                onClick={handleCreate}
              >
                <PlusIcon />
                Nuevo administrador
              </Button>
            </DialogTrigger>
          )}
          <DialogContent
            className="sm:max-w-[425px]"
            onPointerDownOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>
                {selectedAdmin ? "Editar administrador" : "Nuevo administrador"}
              </DialogTitle>
            </DialogHeader>

            {selectedAdmin ? (
              // @ts-ignore
              <FormEditAdmin admin={selectedAdmin} setOpen={setOpen} />
            ) : (
              <FormCreateAdmin setOpen={setOpen} />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
