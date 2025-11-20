"use client";

import { editUser } from "@/actions/users";
import { getUser } from "@/actions/users/admin/getUser";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
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
  const [formData, setFormData] = useState<any>({});
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      const userData = await getUser(id);
      return userData;
    },
    enabled: !!id,
  });

  // Sincronizar formData cuando cambia el data (por cambio de id o refetch)
  useEffect(() => {
    if (!data) return;
    // Clonar y normalizar fechas a ISO (yyyy-mm-dd) para inputs tipo date si existen
    const clone = JSON.parse(JSON.stringify(data));
    if (clone.fechaInicioMembresia) {
      try {
        clone.fechaInicioMembresia = new Date(clone.fechaInicioMembresia)
          .toISOString()
          .slice(0, 10);
      } catch {
        // dejar tal cual si no es convertible
      }
    }
    setFormData(clone);
  }, [data, id]);

  const userMutation = useMutation({
    mutationFn: editUser,
    onSuccess: () => {
      toast.success("Usuario actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: ["user", id] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Error al actualizar usuario");
    },
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    let parsedValue: any = value;

    if (type === "checkbox") parsedValue = checked;
    else if (type === "number") parsedValue = value === "" ? "" : Number(value);

    // Manejo especial para la selección de tarifa
    if (name === "tarifa") {
      // Se asume que el value trae el id de la tarifa seleccionada
      if (
        data?.configuracionTarifa?.tipoConfiguracion ===
        TipoConfiguracionTarifa.DINAMICA_POR_FECHA_INGRESO
      ) {
        setFormData((prev: any) => ({
          ...prev,
          dinamicaTarifaId: parsedValue || null,
          rangoTarifaId: null,
          nombreTarifaAsignada:
            tarifasDisponibles?.find((t: any) => t.id === parsedValue)
              ?.nombre || null,
        }));
        return;
      } else {
        setFormData((prev: any) => ({
          ...prev,
          rangoTarifaId: parsedValue || null,
          dinamicaTarifaId: null,
          nombreTarifaAsignada:
            tarifasDisponibles?.find((t: any) => t.id === parsedValue)
              ?.nombre || null,
        }));
        return;
      }
    }

    setFormData((prevData: any) => ({
      ...prevData,
      [name]: parsedValue,
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!formData) return;

    // Preparar payload: convertir strings de fecha a ISO completo si hace falta
    const payload = { ...formData, id };
    if (payload.fechaInicioMembresia) {
      // si viene en formato yyyy-mm-dd, convertir a ISO completo
      const d = new Date(payload.fechaInicioMembresia);
      if (!isNaN(d.getTime())) payload.fechaInicioMembresia = d.toISOString();
    }

    toast.info("Actualizando usuario...");
    userMutation.mutate(payload);
  };

  const isDynamicTariff =
    data?.configuracionTarifa?.tipoConfiguracion ===
    TipoConfiguracionTarifa.DINAMICA_POR_FECHA_INGRESO;

  if (isLoading) return <LoadingState />;
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
            //@ts-ignore
            configuracionTarifa={data.configuracionTarifa}
            //@ts-ignore
            fechaInicioMembresia={data.fechaInicioMembresia}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
