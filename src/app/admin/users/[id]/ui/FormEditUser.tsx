"use client";

import { editUser } from "@/actions/users";
import { getUser } from "@/actions/users/admin/getUser";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { ModalEditPayment } from "./ModalEditPayment";
import {
  ArrowLeft,
  User,
  Save,
  Loader2,
  CreditCard,
  Calendar,
  DollarSign,
  AlertCircle,
  Phone,
  Hash,
  UserCheck,
} from "lucide-react";
import { PagosGrid } from "./pagos/PagosGrid";

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

  if (isPending) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Cargando información del usuario...
            </h3>
            <p className="text-gray-600 text-sm">Esto solo tomará un momento</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-red-200 max-w-md mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error al cargar usuario
            </h3>
            <p className="text-gray-600 text-sm">
              {error?.message || "Ha ocurrido un error inesperado"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con navegación */}
      <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/admin/users/list"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-lg transition-all duration-300 mr-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Link>
            <div className="flex items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 capitalize">
                  {data?.nombre} {data?.apellido}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario de edición */}
      <div className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-emerald-50 p-6 border-b border-purple-100">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <UserCheck className="w-5 h-5 mr-2 text-purple-600" />
            Información Personal
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Actualiza los datos del usuario
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                //@ts-ignore
                value={formData?.nombre || ""}
                onChange={handleChange}
                className="w-full h-11 px-4 text-base border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-300 placeholder:text-gray-400 bg-purple-50/50"
                placeholder="Ingrese el nombre"
              />
            </div>

            {/* Apellido */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Apellido
              </label>
              <input
                type="text"
                name="apellido"
                //@ts-ignore
                value={formData?.apellido || ""}
                onChange={handleChange}
                className="w-full h-11 px-4 text-base border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-300 placeholder:text-gray-400 bg-purple-50/50"
                placeholder="Ingrese el apellido"
              />
            </div>

            {/* Documento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Hash className="w-4 h-4 inline mr-1" />
                Documento
              </label>
              <input
                type="text"
                name="documento"
                //@ts-ignore
                value={formData?.documento || ""}
                onChange={handleChange}
                className="w-full h-11 px-4 text-base border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-300 placeholder:text-gray-400 bg-purple-50/50"
                placeholder="Ej: 12345678"
              />
            </div>

            {/* Edad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Edad
              </label>
              <input
                type="number"
                name="edad"
                //@ts-ignore

                value={formData?.edad || ""}
                onChange={handleChange}
                className="w-full h-11 px-4 text-base border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-300 placeholder:text-gray-400 bg-purple-50/50"
                placeholder="Ej: 25"
              />
            </div>

            {/* Teléfono */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Teléfono
              </label>
              <input
                type="text"
                name="telefono"
                //@ts-ignore
                value={formData?.telefono || ""}
                onChange={handleChange}
                className="w-full h-11 px-4 text-base border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-300 placeholder:text-gray-400 bg-purple-50/50"
                placeholder="Ej: +54 11 1234-5678"
              />
            </div>
          </div>

          {/* Botón de guardar */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={userMutation.isPending}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:transform-none transition-all duration-300 disabled:cursor-not-allowed"
            >
              {userMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Historial de Pagos */}
      {data?.pagos?.length && <PagosGrid pagos={data.pagos} id={id} />}
    </div>
  );
};
