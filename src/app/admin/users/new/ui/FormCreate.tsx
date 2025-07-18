"use client";

import { addUserToAdmin } from "@/actions/users";
import { InputField } from "@/components";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { FaQuestionCircle } from "react-icons/fa";

interface UserFormData {
  nombre: string;
  apellido: string;
  edad: number;
  documento: string;
  telefono: string;
  primerPagoMesSiguiente: boolean;
}

interface FormCreateProps {
  administradorId: string;
}

export const FormCreate = ({ administradorId }: FormCreateProps) => {
  console.log(administradorId);
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserFormData>();

  const mutation = useMutation({
    mutationFn: addUserToAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["usuarios", session?.user?.id],
      });
      reset();
    },
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      await mutation.mutateAsync({
        ...data,
        administradorId,
      });
    } catch (error) {
      console.error("Error al agregar usuario:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Agregar Nuevo Usuario
      </h2>

      {/* Mensajes de estado */}
      {mutation.isError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {mutation.error?.message || "Error al agregar el usuario"}
        </div>
      )}

      {mutation.isSuccess && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          Usuario agregado exitosamente!
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <InputField
          type="text"
          id="apellido"
          label="Apellido"
          error={errors.apellido?.message}
          register={register("apellido")}
        />
        <InputField
          type="text"
          id="nombre"
          label="Nombre"
          error={errors.nombre?.message}
          register={register("nombre", {
            required: "El nombre es requerido",
            minLength: {
              value: 3,
              message: "El nombre debe tener al menos 3 caracteres",
            },
          })}
        />

        <InputField
          type="text"
          id="documento"
          label="Documento"
          error={errors.documento?.message}
          register={register("documento", {
            required: "El documento es requerido",
            pattern: {
              value: /^\d{8,12}$/,
              message: "El documento debe tener entre 8 y 12 dígitos",
            },
          })}
        />
        <InputField
          type="number"
          id="edad"
          label="Edad"
          error={errors.nombre?.message}
          register={register("edad")}
          required={false}
        />

        <InputField
          type="tel"
          id="telefono"
          label="Teléfono"
          required={false}
          error={errors.telefono?.message}
          register={register("telefono", {
            pattern: {
              value: /^[0-9]+$/,
              message: "Ingrese un número de teléfono válido",
            },
          })}
        />

        <div className="flex items-center">
          <input
            id="primerPagoMesSiguiente"
            type="checkbox"
            className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500"
            {...register("primerPagoMesSiguiente")}
          />
          <label
            htmlFor="primerPagoMesSiguiente"
            className="ml-2 text-sm font-medium text-gray-900 flex items-center"
          >
            Primer Pago Mes Siguiente
            {/* Icono de ayuda (signo de pregunta) */}
            <span className="relative group">
              <FaQuestionCircle className="w-4 h-4 text-gray-500 ms-2" />
              <span className="absolute hidden group-hover:block z-10 w-64 p-2 text-xs text-gray-700 bg-white border border-gray-200 rounded-lg shadow-lg -left-32 top-6">
                Si activas esta opción, el primer pago se generará el mes
                siguiente.
                <strong> Por defecto, se crea en el mes actual.</strong>
              </span>
            </span>
          </label>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={mutation.isPending}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              mutation.isPending
                ? "bg-blue-400"
                : "bg-blue-600 hover:bg-blue-700"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {mutation.isPending ? (
              <>
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
                Agregando...
              </>
            ) : (
              "Agregar Usuario"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
