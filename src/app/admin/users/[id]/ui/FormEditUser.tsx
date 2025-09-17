"use client";

import { editUser } from "@/actions/users";
import { getUser } from "@/actions/users/admin/getUser";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { TipoConfiguracionTarifa } from "@prisma/client";
import {
  LoadingState,
  ErrorState,
  UserHeader,
  UserForm,
  PagosGrid,
} from "@/01-components/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const FormEditUser = ({ id, tarifasDisponibles }: any) => {
  const [formData, setFormData] = useState({});
  const queryClient = useQueryClient();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      const userData = await getUser(id);
      setFormData(userData);
      return userData;
    },
    enabled: !!id,
  });

  const userMutation = useMutation({
    mutationFn: editUser,
    onSuccess: () => {
      toast.success("Usuario actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: ["user", id] });
    },
    onError: (error) => {
      toast.error(error.message || "Error al actualizar usuario");
    },
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (name === "tarifa") {
    }
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (formData) {
      const dataToSubmit = {
        ...formData,
        id: id, // Include the user ID required by the server schema
      };
      toast.info("Actualizando usuario...");
      //@ts-ignore
      userMutation.mutate(dataToSubmit);
    }
  };

  const isDynamicTariff =
    data?.configuracionTarifa?.tipoConfiguracion ===
    TipoConfiguracionTarifa.DINAMICA_POR_FECHA_INGRESO;

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState error={error} />;

  const tarifaActual = data?.dinamicaTarifa?.id || data?.rangoTarifa?.id;

  console.log({ data });

  return (
    <div className="space-y-6">
      <UserHeader data={data} isDynamicTariff={isDynamicTariff} />

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-emerald-50 to-purple-50 border border-emerald-200">
          <TabsTrigger
            value="personal"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white"
          >
            Información Personal
          </TabsTrigger>
          <TabsTrigger
            value="pagos"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
          >
            Información de Pagos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-6">
          <UserForm
            formData={formData}
            originalData={data}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            isLoading={userMutation.isPending}
            tarifasDisponibles={tarifasDisponibles}
            tarifaActual={tarifaActual}
          />
        </TabsContent>

        <TabsContent value="pagos" className="mt-6">
          <PagosGrid
            //@ts-ignore
            pagos={data.pagos}
            id={id}
            configuracionTarifa={data.configuracionTarifa}
            //@ts-ignore
            fechaInicioMembresia={data.fechaInicioMembresia}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
