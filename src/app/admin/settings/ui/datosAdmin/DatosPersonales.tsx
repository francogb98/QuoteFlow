"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { editAdmin } from "@/actions";

interface Inputs {
  nombre: string;
  documento: string;
  empresa: string;
}

function DatosPersonales({ documento, empresa, nombre }: Inputs) {
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nombre: nombre,
      documento: documento,
      empresa: empresa,
    },
  });

  const edit = useMutation({
    mutationFn: editAdmin,
    onSuccess: async (result) => {
      if (!result.ok) {
        setErrorMessage(result.error || "Ocurrió un error desconocido.");
        return;
      }

      setErrorMessage("");
      setIsEditing(false);
    },
    onError: (error) => {
      setErrorMessage("Error al guardar los cambios: " + error.message);
    },
  });

  const onSubmit = (data: any) => {
    setErrorMessage("");
    edit.mutate(data);
  };

  return (
    <section>
      <h1 className="text-3xl font-bold capitalize mb-3">
        Sección Datos Personales
      </h1>

      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-purple-100 mb-8 overflow-hidden relative">
        {/* Botón Editar */}
        <div className="absolute top-3 right-3">
          <button
            className="p-2 bg-white/80 border border-purple-300 rounded-full shadow hover:bg-purple-100 transition cursor-pointer"
            title="Editar"
            onClick={() => {
              setIsEditing(!isEditing);
              reset({
                nombre: nombre || "",
                documento: documento || "",
                empresa: empresa || "",
              });
              setErrorMessage("");
            }}
          >
            <Pencil className="w-4 h-4 text-purple-700" />
          </button>
        </div>

        <div className="p-6">
          {errorMessage && (
            <p className="text-sm text-red-600 mb-4">{errorMessage}</p>
          )}

          {edit.isSuccess && (
            <p className="text-sm text-green-600 mb-4">
              Datos guardados correctamente
            </p>
          )}

          {isEditing ? (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div>
                <label htmlFor="nombre" className="text-sm text-gray-600">
                  Nombre
                </label>
                <input
                  id="nombre"
                  {...register("nombre", {
                    required: "Este campo es obligatorio",
                  })}
                  className="w-full border rounded p-2"
                />
                {errors.nombre && (
                  <p className="text-red-500 text-sm">
                    {errors.nombre.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="documento" className="text-sm text-gray-600">
                  Documento
                </label>
                <input
                  id="documento"
                  {...register("documento", {
                    required: "Documento obligatorio",
                  })}
                  className="w-full border rounded p-2"
                />
                {errors.documento && (
                  <p className="text-red-500 text-sm">
                    {errors.documento.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="empresa" className="text-sm text-gray-600">
                  Empresa
                </label>
                <input
                  id="empresa"
                  {...register("empresa")}
                  className="w-full border rounded p-2"
                />
              </div>

              <div className="col-span-1 md:col-span-3 flex gap-3 mt-4">
                <button
                  type="submit"
                  disabled={edit.isPending}
                  className={`${
                    edit.isPending
                      ? "bg-purple-400 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700"
                  } text-white px-4 py-2 rounded`}
                >
                  {edit.isPending ? "Guardando..." : "Guardar"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setErrorMessage(""); // Clear error on cancel
                    reset({
                      // Reset to current user values on cancel
                      nombre: nombre || "",
                      documento: documento || "",
                      empresa: empresa || "",
                    });
                  }}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nombre</p>
                <p className="font-semibold text-gray-900">
                  {nombre || "No especificado"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Documento</p>
                <p className="font-semibold text-gray-900">
                  {documento || "No especificado"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Empresa</p>
                <p className="font-semibold text-gray-900">
                  {empresa || "No especificado"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export { DatosPersonales };
