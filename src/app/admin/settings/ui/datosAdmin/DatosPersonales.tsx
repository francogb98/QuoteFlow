"use client";

import { useState } from "react";
import { Pencil, X, User, Mail, Building, FileText } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { editAdmin } from "@/01-actions/admin/account/editAdmin";

interface Inputs {
  nombre: string;
  documento: string;
  empresa: string;
  email: string;
  role: string; // <-- Add the role prop
}

function DatosPersonales({ documento, empresa, nombre, email, role }: Inputs) {
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isProfesor = role === "PROFESOR"; // <-- Check the role

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
      email: email,
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

      if (result.data) {
        reset({
          nombre: result.data.nombre,
          documento: result.data.documento,
          empresa: result.data.empresa?.nombre || "",
          email: result.data.email || "",
        });
      }
    },
    onError: (error) => {
      setErrorMessage("Error al guardar los cambios: " + error.message);
    },
  });

  const onSubmit = (data: any) => {
    setErrorMessage("");
    edit.mutate(data);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrorMessage("");
    reset({
      nombre: nombre || "",
      documento: documento || "",
      empresa: empresa || "",
      email: email || "",
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Datos Personales
        </h1>
        <p className="text-gray-600">
          Gestiona tu información personal y de contacto
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-50 to-purple-50 px-6 py-4 border-b border-emerald-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            Información Personal
          </h2>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-white border border-emerald-300 rounded-lg shadow-sm hover:bg-emerald-50 transition-colors"
            onClick={() => {
              setIsEditing(!isEditing);
              reset({
                nombre: nombre || "",
                documento: documento || "",
                empresa: empresa || "",
                email: email || "",
              });
              setErrorMessage("");
            }}
          >
            {isEditing ? (
              <>
                <X className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">
                  Cancelar
                </span>
              </>
            ) : (
              <>
                <Pencil className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-600">
                  Editar
                </span>
              </>
            )}
          </button>
        </div>

        <div className="p-6">
          {errorMessage && (
            <div className="bg-red-50 border-l-4 border-red-400 rounded-r-lg p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}

          {edit.isSuccess && !errorMessage && (
            <div className="bg-emerald-50 border-l-4 border-emerald-400 rounded-r-lg p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-emerald-700">
                    Datos guardados correctamente
                  </p>
                </div>
              </div>
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="nombre"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                  >
                    <User className="w-4 h-4 text-emerald-600" />
                    Nombre
                  </label>
                  <input
                    id="nombre"
                    {...register("nombre", {
                      required: "Este campo es obligatorio",
                    })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                    placeholder="Ingresa tu nombre"
                  />
                  {errors.nombre && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.nombre.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="documento"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                  >
                    <FileText className="w-4 h-4 text-emerald-600" />
                    Documento
                  </label>
                  <input
                    id="documento"
                    {...register("documento", {
                      required: "Documento obligatorio",
                    })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                    placeholder="Número de documento"
                  />
                  {errors.documento && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.documento.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                  >
                    <Mail className="w-4 h-4 text-emerald-600" />
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register("email", {
                      required: "Email obligatorio",
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: "Email no válido",
                      },
                    })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                    placeholder="tu@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="empresa"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                  >
                    <Building className="w-4 h-4 text-emerald-600" />
                    Empresa
                  </label>
                  <input
                    id="empresa"
                    {...register("empresa")}
                    className={`w-full border rounded-lg px-4 py-3 transition-colors ${
                      isProfesor
                        ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200"
                        : "border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    }`}
                    placeholder="Nombre de la empresa"
                    disabled={isProfesor} // <-- Disable the input based on the role
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={edit.isPending}
                  className={`${
                    edit.isPending
                      ? "bg-emerald-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                  } text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md`}
                >
                  {edit.isPending ? "Guardando..." : "Guardar Cambios"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  Nombre
                </div>
                <p className="text-lg font-semibold text-gray-900 bg-gray-50 rounded-lg px-4 py-3">
                  {nombre || "No especificado"}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Documento
                </div>
                <p className="text-lg font-semibold text-gray-900 bg-gray-50 rounded-lg px-4 py-3">
                  {documento || "No especificado"}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                  <Mail className="w-4 h-4 text-emerald-600" />
                  Email
                </div>
                <p className="text-lg font-semibold text-gray-900 bg-gray-50 rounded-lg px-4 py-3">
                  {email || "No especificado"}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                  <Building className="w-4 h-4 text-emerald-600" />
                  Empresa
                </div>
                <p className="text-lg font-semibold text-gray-900 bg-gray-50 rounded-lg px-4 py-3">
                  {empresa || "No especificado"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { DatosPersonales };
