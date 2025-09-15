"use client";

import { toast } from "sonner";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { addBulkUsersToAdmin } from "@/actions/admin/users/lib/bulk.users";

export function BulkUserForm({ empresaId, configuracionTarifa }: any) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isDynamicTariff =
    configuracionTarifa.tipoConfiguracion === "DINAMICA_POR_FECHA_INGRESO";

  const {
    register,
    control,
    handleSubmit,
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
      queryClient.invalidateQueries({ queryKey: ["users", empresaId] });
      toast.success("Usuarios cargados exitosamente.");
      router.push(`/admin/users`);
    },
    onError: () => {
      toast.error("Error al cargar los usuarios.");
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
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

  const removeUser = (index: number) => {
    remove(index);
  };

  const uniqueTarifas = isDynamicTariff
    ? [...(configuracionTarifa.dinamicas || [])]
    : [...(configuracionTarifa.rangos || [])];

  return (
    <Card className="max-w-7xl mx-auto">
      <CardHeader>
        <CardTitle>Cargar múltiples usuarios</CardTitle>
        <CardDescription>
          Complete la información de los usuarios y asigne sus tarifas
          correspondientes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Tabla de usuarios */}
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Nombre
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Apellido
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Documento
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Tarifa
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha Inicio
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Pago mes sig.
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {fields.map((field, index) => (
                  <tr key={field.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        {...register(`users.${index}.nombre`, {
                          required: "El nombre es requerido",
                        })}
                        type="text"
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Nombre"
                      />
                      {errors.users?.[index]?.nombre && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.users[index].nombre.message as string}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <input
                        {...register(`users.${index}.apellido`, {
                          required: "El apellido es requerido",
                        })}
                        type="text"
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Apellido"
                      />
                      {errors.users?.[index]?.apellido && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.users[index].apellido.message as string}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <input
                        {...register(`users.${index}.documento`, {
                          required: "El documento es requerido",
                        })}
                        type="text"
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="12345678"
                      />
                      {errors.users?.[index]?.documento && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.users[index].documento.message as string}
                        </p>
                      )}
                    </td>

                    {/* Selección de tarifa */}
                    <td className="px-4 py-3">
                      <select
                        {...register(
                          isDynamicTariff
                            ? `users.${index}.dinamicaTarifaId`
                            : `users.${index}.rangoTarifaId`,
                          { required: "Debe seleccionar una tarifa" }
                        )}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="">Seleccionar tarifa</option>
                        {uniqueTarifas.map((tarifa: any) => (
                          <option key={tarifa.id} value={tarifa.id}>
                            {isDynamicTariff
                              ? `${tarifa.nombre} - $${tarifa.montoBase}`
                              : `${tarifa.nombre} - $${tarifa.monto}`}
                          </option>
                        ))}
                      </select>
                      {errors.users?.[index] &&
                        (errors.users[index].dinamicaTarifaId ||
                          errors.users[index].rangoTarifaId) && (
                          <p className="text-red-500 text-xs mt-1">
                            Debe seleccionar una tarifa
                          </p>
                        )}
                    </td>

                    {/* Fecha de inicio */}
                    <td className="px-4 py-3">
                      <input
                        {...register(`users.${index}.fechaInicioMembresia`, {
                          required: "La fecha es requerida",
                        })}
                        type="date"
                        className="w-full px-3 py-2 border rounded-md"
                      />
                      {errors.users?.[index]?.fechaInicioMembresia && (
                        <p className="text-red-500 text-xs mt-1">
                          {
                            errors.users[index].fechaInicioMembresia
                              .message as string
                          }
                        </p>
                      )}
                    </td>

                    {/* Primer pago mes siguiente */}
                    <td className="px-4 py-3 text-center">
                      <input
                        {...register(`users.${index}.primerPagoMesSiguiente`)}
                        type="checkbox"
                        className="w-5 h-5 text-purple-600 border-gray-300 rounded"
                      />
                    </td>

                    <td className="px-4 py-3">
                      <Button
                        type="button"
                        onClick={() => removeUser(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Botón para agregar usuario */}
          <div className="mt-4 flex justify-between items-center">
            <Button
              type="button"
              onClick={addUser}
              variant="outline"
              className="flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Agregar usuario
            </Button>

            <Button type="submit" disabled={isSubmitting || mutation.isPending}>
              {isSubmitting || mutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                "Cargar usuarios"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
