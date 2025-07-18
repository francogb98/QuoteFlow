"use client";
import { editUser } from "@/actions/users";
import type React from "react";

import { getUser } from "@/actions/users/admin/getUser";
import { updatePaymentStatus } from "@/actions/payments/updatePaymentStatus"; // Importa la nueva acción
import type { UsuarioWithPagos } from "@/types/usuarios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { type Pago, $Enums } from "@prisma/client"; // Importa Pago y $Enums
import Link from "next/link";
import { IoArrowBack } from "react-icons/io5";

interface Props {
  id: string;
}

// Tipos para los estados del pago (usar los del enum de Prisma)
const estadosPago = [
  { value: $Enums.EstadoPago.PAGADO, label: "Pagado" },
  { value: $Enums.EstadoPago.PENDIENTE, label: "Pendiente" },
  { value: $Enums.EstadoPago.VENCIDO, label: "Vencido" },
] as const;

export const FormEditUser = ({ id }: Props) => {
  const [formData, setFormData] = useState<Partial<UsuarioWithPagos>>({});
  const queryClient = useQueryClient();

  const { data, isPending, isError, error } = useQuery<UsuarioWithPagos>({
    queryKey: ["user", id],
    queryFn: async () => {
      const userData = await getUser(id);
      setFormData(userData); // Mover el onSuccess aquí
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
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar usuario");
    },
  });

  // Nueva mutación para actualizar el estado del pago
  const paymentStatusMutation = useMutation({
    mutationFn: async ({
      paymentId,
      newStatus,
    }: {
      paymentId: string;
      newStatus: $Enums.EstadoPago;
    }) => {
      const result = await updatePaymentStatus(paymentId, newStatus);
      if (!result.ok) {
        throw new Error(result.message);
      }
      return result;
    },
    onSuccess: (data, variables) => {
      toast.success(
        data.message || `Estado de pago ${variables.paymentId} actualizado.`
      );
      queryClient.invalidateQueries({ queryKey: ["user", id] }); // Revalidar los datos del usuario para ver el cambio
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar el estado del pago.");
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Nuevo handler para el cambio de estado de pago
  const handlePaymentStatusChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    pago: Pago
  ) => {
    const newStatus = e.target.value as $Enums.EstadoPago;
    toast.info(`Actualizando pago de ${pago.mes}/${pago.año}...`);
    paymentStatusMutation.mutate({ paymentId: pago.id, newStatus });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      toast.info("Actualizando usuario...");
      userMutation.mutate(formData);
    }
  };

  if (isPending) return <div>Cargando información de usuario...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  return (
    <div>
      <div>
        <Link
          href="/admin/users/list"
          className="flex items-center w-fit mb-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
        >
          <IoArrowBack className="mr-2" />
          Volver
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow p-6 mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              name="nombre"
              value={formData?.nombre || ""}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apellido
            </label>
            <input
              type="text"
              name="apellido"
              value={formData?.apellido || ""}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Documento
            </label>
            <input
              type="text"
              name="documento"
              value={formData?.documento || ""}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Edad
            </label>
            <input
              type="number"
              name="edad"
              value={formData?.edad || ""}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              type="text"
              name="telefono"
              value={formData?.telefono || ""}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={userMutation.isPending}
            className={`flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              userMutation.isPending
                ? "bg-blue-400"
                : "bg-blue-600 hover:bg-blue-700"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {userMutation.isPending ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Guardando...
              </div>
            ) : (
              "Guardar Cambios"
            )}
          </button>
        </div>
      </form>
      {/* Sección de Pagos */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Historial de Pagos</h2>
        {data?.pagos?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.pagos.map((pago) => (
              <div key={pago.id} className="border rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium">${pago.monto.toFixed(2)}</span>
                  {/* Selector de estado para el pago */}
                  <div className="relative">
                    <select
                      name={`estado-pago-${pago.id}`} // Nombre único para el select
                      value={pago.estado}
                      onChange={(e) => handlePaymentStatusChange(e, pago)}
                      className={`px-2 py-1 text-xs rounded-full border appearance-none pr-6 cursor-pointer
                        ${
                          pago.estado === "PAGADO"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : pago.estado === "PENDIENTE"
                            ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                            : "bg-red-100 text-red-800 border-red-200"
                        }`}
                      disabled={
                        paymentStatusMutation.isPending &&
                        paymentStatusMutation.variables?.paymentId === pago.id
                      }
                    >
                      {estadosPago.map((estadoOption) => (
                        <option
                          key={estadoOption.value}
                          value={estadoOption.value}
                        >
                          {estadoOption.label}
                        </option>
                      ))}
                    </select>
                    {paymentStatusMutation.isPending &&
                    paymentStatusMutation.variables?.paymentId === pago.id ? (
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center">
                        <svg
                          className="animate-spin h-3 w-3 text-gray-500"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </div>
                    ) : (
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg
                          className="fill-current h-4 w-4 text-gray-500"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.096 6.924 4.682 8.338z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-1">
                  Fecha: {new Date(pago.fecha).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-600">
                  Método: {pago.metodo || "No especificado"}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No hay registros de pago</p>
        )}
      </div>
    </div>
  );
};
