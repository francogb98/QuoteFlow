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
  DynamicTariffAlert,
  UserForm,
  PagosGrid,
} from "@/01-components/admin";

export const FormEditUser = ({ id }: any) => {
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
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (formData) {
      toast.info("Actualizando usuario...");
      userMutation.mutate(formData);
    }
  };

  const isDynamicTariff =
    data?.configuracionTarifa?.tipoConfiguracion ===
    TipoConfiguracionTarifa.DINAMICA_POR_FECHA_INGRESO;

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState error={error} />;

  return (
    <div className="space-y-6">
      <UserHeader data={data} isDynamicTariff={isDynamicTariff} />

      {isDynamicTariff && <DynamicTariffAlert data={data} />}

      <UserForm
        formData={formData}
        originalData={data}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        isLoading={userMutation.isPending}
      />

      <PagosGrid
        //@ts-ignore
        pagos={data.pagos}
        id={id}
        configuracionTarifa={data.configuracionTarifa}
        //@ts-ignore
        fechaInicioMembresia={data.fechaInicioMembresia}
      />
    </div>
  );
};
