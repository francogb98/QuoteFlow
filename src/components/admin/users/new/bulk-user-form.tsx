"use client";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, Trash2, ClipboardPaste } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { addBulkUsersToAdmin } from "@/actions/admin/users/lib/bulk.users";

export function BulkUserForm({
  empresaId,
  configuracionTarifa,
  onSuccess,
}: any) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const isDynamicTariff =
    configuracionTarifa.tipoConfiguracion === "DINAMICA_POR_FECHA_INGRESO";

  const {
    register,
    control,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      users: [
        {
          nombre: "",
          apellido: "",
          documento: "",
          rangoTarifaId: "",
          dinamicaTarifaId: "",
          fechaInicioMembresia: "",
          primerPagoMesSiguiente: false,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "users",
  });

  const mutation = useMutation({
    mutationFn: addBulkUsersToAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      toast.success("Usuarios cargados correctamente");
      onSuccess?.();
      router.refresh();
    },
    onError: () => {
      toast.error("Error al cargar los usuarios");
    },
  });

  const onSubmit = (data: any) => {
    const docs = data.users.map((u: any) => u.documento);
    const duplicates = docs.filter(
      (d: string, i: number) => docs.indexOf(d) !== i,
    );

    if (duplicates.length > 0) {
      toast.error("Hay documentos duplicados en la carga");
      return;
    }
    mutation.mutate({
      //@ts-ignore
      empresaId,
      users: data.users,
    });
  };

  const addUser = () => {
    append({
      nombre: "",
      apellido: "",
      documento: "",
      rangoTarifaId: "",
      dinamicaTarifaId: "",
      fechaInicioMembresia: "",
      primerPagoMesSiguiente: false,
    });
  };

  const addManyUsers = (count = 10) => {
    for (let i = 0; i < count; i++) addUser();
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const rows = text.split("\n");

      rows.forEach((row) => {
        const [nombre, apellido, documento] = row.split("\t");

        if (!nombre || !apellido) return;

        append({
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          documento: documento?.trim() || "",
          rangoTarifaId: "",
          dinamicaTarifaId: "",
          fechaInicioMembresia: "",
          primerPagoMesSiguiente: false,
        });
      });

      toast.success("Usuarios pegados desde Excel");
    } catch {
      toast.error("No se pudo leer el portapapeles");
    }
  };

  const uniqueTarifas = isDynamicTariff
    ? [...(configuracionTarifa.dinamicas || [])]
    : Object.values(
        (configuracionTarifa.rangos || []).reduce((acc: any, tarifa: any) => {
          if (!acc[tarifa.nombre]) {
            acc[tarifa.nombre] = tarifa;
          }
          return acc;
        }, {}),
      );

  return (
    <Card className="max-w-7xl mx-auto">
      <CardHeader>
        <CardTitle>Cargar múltiples usuarios</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* BOTONES SUPERIORES */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              type="button"
              onClick={addUser}
              variant="outline"
              className="flex gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Agregar fila
            </Button>

            <Button
              type="button"
              onClick={() => addManyUsers(10)}
              variant="outline"
            >
              +10 filas
            </Button>
          </div>

          {/* TABLA */}
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 text-left">Nombre</th>
                  <th className="p-2 text-left">Apellido</th>
                  <th className="p-2 text-left">Documento</th>
                  <th className="p-2 text-left">Tarifa</th>
                  <th className="p-2 text-left">Inicio</th>
                  <th className="p-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      Mes sig.
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="w-4 h-4 text-gray-400 cursor-pointer" />
                          </TooltipTrigger>

                          <TooltipContent className="max-w-xs text-center">
                            Clickea si deseas que el primer pago del usuario sea
                            correspondiente al mes siguiente.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </th>
                  <th className="p-2"></th>
                </tr>
              </thead>

              <tbody>
                {fields.map((field, index) => (
                  <tr key={field.id} className="border-t">
                    <td className="p-2">
                      <input
                        {...register(`users.${index}.nombre`, {
                          required: true,
                        })}
                        className="w-full border rounded px-2 py-1"
                      />
                    </td>

                    <td className="p-2">
                      <input
                        {...register(`users.${index}.apellido`, {
                          required: true,
                        })}
                        className="w-full border rounded px-2 py-1"
                      />
                    </td>

                    <td className="p-2">
                      <input
                        {...register(`users.${index}.documento`, {
                          required: true,
                        })}
                        className="w-full border rounded px-2 py-1"
                      />
                    </td>

                    <td className="p-2">
                      <select
                        {...register(
                          isDynamicTariff
                            ? `users.${index}.dinamicaTarifaId`
                            : `users.${index}.rangoTarifaId`,
                          { required: true },
                        )}
                        className="w-full border rounded px-2 py-1"
                      >
                        <option value="">Seleccionar</option>

                        {uniqueTarifas.map((tarifa: any) => (
                          <option key={tarifa.id} value={tarifa.id}>
                            {tarifa.nombre}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="p-2">
                      <input
                        type="date"
                        {...register(`users.${index}.fechaInicioMembresia`, {
                          required: true,
                        })}
                        className="border rounded px-2 py-1"
                      />
                    </td>

                    <td className="p-2 text-center">
                      <input
                        type="checkbox"
                        {...register(`users.${index}.primerPagoMesSiguiente`)}
                      />
                    </td>

                    <td className="p-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* BOTON FINAL */}
          <div className="flex justify-end mt-6">
            <Button type="submit" disabled={mutation.isPending || isSubmitting}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cargando
                </>
              ) : (
                "Crear usuarios"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
