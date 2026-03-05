"use client";

import { editUser } from "@/actions/users";
import { getUser } from "@/actions/users/admin/getUser";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { TipoConfiguracionTarifa } from "@prisma/client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ErrorState } from "../user/ErrorState";
import { LoadingState } from "../user/LoadingState";
import { PagosGrid } from "../user/pagos/PagosGrid";
import { UserForm } from "../user/UserForm";
import { UserHeader } from "../user/UserHeader";
import { getNameTarifas } from "@/01-actions/admin/tarifas/get-name-tarifas";

export const FormEditUser = ({ id }: any) => {
  const [formData, setFormData] = useState<any>({});
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      const userData = await getUser(id);
      return userData;
    },
    enabled: !!id,
  });

  const { data: tarifas, isLoading: isLoadingTarifas } = useQuery({
    queryKey: ["tarifas"],
    queryFn: getNameTarifas,
  });

  useEffect(() => {
    if (!data) return;

    const clone = JSON.parse(JSON.stringify(data));

    if (clone.fechaInicioMembresia) {
      try {
        clone.fechaInicioMembresia = new Date(clone.fechaInicioMembresia)
          .toISOString()
          .slice(0, 10);
      } catch {}
    }

    // SINCRONIZAR TARIFA SELECCIONADA
    clone.tarifa = clone.dinamicaTarifaId || clone.rangoTarifaId || "";

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

    if (name === "tarifa") {
      const selected = parsedValue || null;

      const isDynamic =
        data?.configuracionTarifa?.tipoConfiguracion ===
        TipoConfiguracionTarifa.DINAMICA_POR_FECHA_INGRESO;

      if (isDynamic) {
        setFormData((prev: any) => ({
          ...prev,
          tarifa: selected, // NECESARIO PARA EL BACKEND
          dinamicaTarifaId: selected,
          rangoTarifaId: null,
          nombreTarifaAsignada:
            //@ts-ignore
            tarifasDisponibles?.find((t: any) => t.id === selected)?.nombre ||
            null,
        }));
      } else {
        setFormData((prev: any) => ({
          ...prev,
          tarifa: selected, // NECESARIO PARA EL BACKEND
          rangoTarifaId: selected,
          dinamicaTarifaId: null,
          nombreTarifaAsignada:
            //@ts-ignore
            tarifasDisponibles?.find((t: any) => t.id === selected)?.nombre ||
            null,
        }));
      }

      return;
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

  if (isLoading || isFetching || isLoadingTarifas) return <LoadingState />;
  if (isError) return <ErrorState error={error} />;

  const tarifaActual = data?.dinamicaTarifa?.id || data?.rangoTarifa?.id;
  const nombreTarifaActual =
    data?.dinamicaTarifa?.nombre || data?.rangoTarifa?.nombre;

  //Tarifas de ADMINISTRADOR
  const configuracion = tarifas?.nombreTarifa;
  const tarifasDisponibles =
    configuracion?.tipoConfiguracion === "FIJA_MENSUAL"
      ? Object.values(
          (configuracion.rangos || []).reduce((acc: any, tarifa: any) => {
            if (!acc[tarifa.nombre]) {
              acc[tarifa.nombre] = tarifa;
            }
            return acc;
          }, {}),
        )
      : configuracion?.dinamicas || [];

  return (
    <div className="space-y-6">
      <UserHeader
        data={data}
        isDynamicTariff={isDynamicTariff}
        tarifaActual={nombreTarifaActual}
      />

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
