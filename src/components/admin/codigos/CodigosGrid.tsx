"use client";
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, Tag } from "lucide-react";
import { CodigoPromocional } from "@prisma/client";
import { getPromoCodes, createPromoCode } from "@/actions/admin/codigos";

export const CodigosGrid = () => {
  const queryClient = useQueryClient();

  // 1. Obtener la lista de códigos
  const { data, isPending, isError } = useQuery({
    queryKey: ["promo-codes"],
    queryFn: () => getPromoCodes(),
  });

  // 2. Mutación para crear un nuevo código
  const { mutate, isPending: isCreating } = useMutation({
    mutationFn: createPromoCode,
    onSuccess: () => {
      // Invalida la caché para que React Query vuelva a buscar la lista actualizada
      queryClient.invalidateQueries({ queryKey: ["promo-codes"] });
    },
  });

  if (isPending)
    return <div className="text-center text-gray-500">Cargando códigos...</div>;
  if (isError)
    return (
      <div className="text-center text-red-500">
        Error al cargar los códigos.
      </div>
    );

  const promoCodes = data?.promoCodes || [];

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Códigos de Promoción
        </h1>
        <button
          onClick={() => mutate()}
          disabled={isCreating}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PlusCircle size={20} className="mr-2" />
          {isCreating ? "Creando..." : "Crear Código"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promoCodes.length > 0 ? (
          promoCodes.map((code: CodigoPromocional) => (
            <div
              key={code.id}
              className={`rounded-lg shadow-sm p-4 border ${
                code.estaActivo
                  ? "border-green-500 bg-green-50"
                  : "border-red-500 bg-red-50"
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <Tag size={20} className="text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  {code.codigo}
                </h3>
              </div>
              <div className="text-sm text-gray-600">
                <p>
                  Duración: <b>{code.duracionMeses} meses</b>
                </p>
                <p>
                  Estado: <b>{code.estaActivo ? "Activo" : "Inactivo"}</b>
                </p>
                <p>
                  Creado: {new Date(code.fechaCreacion).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 p-8">
            No se encontraron códigos de promoción.
          </div>
        )}
      </div>
    </div>
  );
};
