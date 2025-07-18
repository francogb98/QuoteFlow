"use client";

import { findUser } from "@/actions/users/public";
import { useMutation } from "@tanstack/react-query";
import { type SubmitHandler, useForm } from "react-hook-form";
import { Search, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  empresa: string;
}

interface Inputs {
  documento: string;
}

export function FormSearchUser({ empresa }: Props) {
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const mutation = useMutation({
    mutationFn: (data: Inputs) => findUser(data.documento, empresa),
    onSuccess: (data) => {
      if (!data.ok) {
        // Si no es exitoso, lanzamos un error para que el onError lo capture
        throw new Error(data.message);
      }
      setSuccess(true);
      router.push(`/${empresa}/${data.usuario!.documento}`);

      setTimeout(() => {
        setSuccess(false);
      }, 1000);
    },
    onError: (error: Error) => {
      // Muestra el error en el formulario
      console.error("Error al buscar usuario:", error.message);
      // Puedes añadir un estado local para mostrar el error en el UI si lo deseas
      // Por ejemplo: setErrorState(error.message);
    },
  });

  const userSearch: SubmitHandler<Inputs> = async (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="max-w-md mx-auto mb-8 px-4 sm:px-0">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sm:p-8">
        <form onSubmit={handleSubmit(userSearch)} className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Buscar DNI
            </h2>
            <p className="text-gray-500 text-sm">
              Ingresa tu documento para consultar tu estado
            </p>
          </div>
          <div className="relative">
            <input
              {...register("documento", {
                required: "El DNI es requerido",
                pattern: {
                  value: /^\d{8,10}$/,
                  message: "Ingrese un DNI válido (8-10 dígitos)",
                },
              })}
              type="text"
              className="w-full h-11 px-4 pr-10 text-base border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-300 placeholder:text-gray-400 bg-purple-50/50"
              placeholder="Ej: 12345678"
              disabled={mutation.isPending}
              maxLength={10}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {mutation.isPending ? (
                <Loader2 className="animate-spin text-purple-500 w-4 h-4" />
              ) : (
                <Search className="text-purple-400 w-4 h-4" />
              )}
            </div>
            {errors.documento && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.documento.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.01] disabled:transform-none text-base disabled:cursor-not-allowed flex items-center justify-center"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="animate-spin mr-2 w-4 h-4" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="mr-2 w-4 h-4" />
                Buscar Usuario
              </>
            )}
          </button>
        </form>
        {mutation.isError && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Error en la búsqueda</p>
              <p className="text-sm">{mutation.error?.message}</p>
            </div>
          </div>
        )}
        {success && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-start">
            <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">¡Usuario encontrado!</p>
              <p className="text-sm">Redirigiendo...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
