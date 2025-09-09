"use client";

import { toast } from "sonner";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  HelpCircle,
  Loader2,
  AlertCircle,
  CheckCircle,
  User,
} from "lucide-react";
import { addUserToAdmin } from "@/actions/admin/users";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface UserFormData {
  nombre: string;
  apellido: string;
  edad: number;
  documento: string;
  telefono: string;
  primerPagoMesSiguiente: boolean;
  fechaInicioMembresia?: string;
  usarFechaPersonalizada: boolean;
  correo?: string;
  rangoTarifaId?: string;
  dinamicaTarifaId?: string;
}

interface FormCreateProps {
  administradorId: string;
  configuracionTarifa?: any;
  onSuccess?: () => void;
  tarifasDisponibles: Array<any>;
  isDynamicTariff: boolean;
}

export const FormCreateUser = ({
  administradorId,
  configuracionTarifa,
  tarifasDisponibles,
  onSuccess,
  isDynamicTariff,
}: FormCreateProps) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<UserFormData>({
    defaultValues: {
      usarFechaPersonalizada: false,
      primerPagoMesSiguiente: false,
    },
  });

  const usarFechaPersonalizada = watch("usarFechaPersonalizada");

  const mutation = useMutation({
    mutationFn: addUserToAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["usuarios"],
      });
      router.refresh();
      toast.success("Usuario agregado exitosamente!");
      setShowSuccess(true);
      reset();
      setTimeout(() => {
        setShowSuccess(false);
        onSuccess?.();
      }, 1500);
    },
    onError: (error) => {
      console.error("Error al agregar usuario:", error);
      toast.error(error.message || "Error al agregar el usuario");
    },
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      const submitData: any = {
        ...data,
        administradorId,
      };

      if (
        isDynamicTariff &&
        data.usarFechaPersonalizada &&
        data.fechaInicioMembresia
      ) {
        submitData.fechaInicioMembresia = new Date(data.fechaInicioMembresia);
      }

      await mutation.mutateAsync(submitData);
    } catch (error) {
      console.error("Error al agregar usuario:", error);
    }
  };

  // 💡 Lógica para obtener tarifas únicas
  const uniqueTarifas = [];
  const namesSeen = new Set();
  if (tarifasDisponibles) {
    for (const tarifa of tarifasDisponibles) {
      // Si la tarifa no es dinámica, filtra por nombre único
      if (!isDynamicTariff) {
        if (!namesSeen.has(tarifa.nombre)) {
          namesSeen.add(tarifa.nombre);
          uniqueTarifas.push(tarifa);
        }
      } else {
        // Si es dinámica, agrega todas las opciones
        uniqueTarifas.push(tarifa);
      }
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <User className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Agregar Nuevo Usuario
          </h2>
          <p className="text-gray-500 text-sm">
            Completa los datos del usuario para agregarlo al sistema
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Apellido */}
          <div>
            <label
              htmlFor="apellido"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Apellido
            </label>
            <input
              {...register("apellido", {
                required: "El apellido es requerido",
                minLength: {
                  value: 2,
                  message: "El apellido debe tener al menos 2 caracteres",
                },
              })}
              type="text"
              className="w-full h-11 px-4 text-base border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-300 placeholder:text-gray-400 bg-purple-50/50"
              placeholder="Ingrese el apellido"
              disabled={mutation.isPending}
            />
            {errors.apellido && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.apellido.message}
              </p>
            )}
          </div>

          {/* Nombre */}
          <div>
            <label
              htmlFor="nombre"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nombre
            </label>
            <input
              {...register("nombre", {
                required: "El nombre es requerido",
                minLength: {
                  value: 3,
                  message: "El nombre debe tener al menos 3 caracteres",
                },
              })}
              type="text"
              className="w-full h-11 px-4 text-base border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-300 placeholder:text-gray-400 bg-purple-50/50"
              placeholder="Ingrese el nombre"
              disabled={mutation.isPending}
            />
            {errors.nombre && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.nombre.message}
              </p>
            )}
          </div>

          {/* Documento */}
          <div>
            <label
              htmlFor="documento"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Documento
            </label>
            <input
              {...register("documento", {
                required: "El documento es requerido",
                pattern: {
                  value: /^\d{8,12}$/,
                  message: "El documento debe tener entre 8 y 12 dígitos",
                },
              })}
              type="text"
              className="w-full h-11 px-4 text-base border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-300 placeholder:text-gray-400 bg-purple-50/50"
              placeholder="Ej: 12345678"
              disabled={mutation.isPending}
              maxLength={12}
            />
            {errors.documento && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.documento.message}
              </p>
            )}
          </div>

          {/* Correo electrónico */}
          <div>
            <label
              htmlFor="correo"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Correo Electrónico{" "}
              <span className="text-gray-400">(opcional)</span>
            </label>
            <input
              {...register("correo", {
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "Ingrese un correo electrónico válido",
                },
              })}
              type="email"
              className="w-full h-11 px-4 text-base border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-300 placeholder:text-gray-400 bg-purple-50/50"
              placeholder="Ej: usuario@correo.com"
              disabled={mutation.isPending}
            />
            {errors.correo && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.correo.message}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Agrega un correo para que el usuario reciba notificaciones de
              pago.
            </p>
          </div>

          {/* Edad */}
          <div>
            <label
              htmlFor="edad"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Edad <span className="text-gray-400">(opcional)</span>
            </label>
            <input
              {...register("edad", {
                min: {
                  value: 1,
                  message: "La edad debe ser mayor a 0",
                },
                max: {
                  value: 120,
                  message: "La edad debe ser menor a 120",
                },
              })}
              type="number"
              className="w-full h-11 px-4 text-base border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-300 placeholder:text-gray-400 bg-purple-50/50"
              placeholder="Ej: 25"
              disabled={mutation.isPending}
            />
            {errors.edad && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.edad.message}
              </p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label
              htmlFor="telefono"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Teléfono <span className="text-gray-400">(opcional)</span>
            </label>
            <input
              {...register("telefono", {
                pattern: {
                  value: /^[0-9+\-\s()]+$/,
                  message: "Ingrese un número de teléfono válido",
                },
              })}
              type="tel"
              className="w-full h-11 px-4 text-base border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-300 placeholder:text-gray-400 bg-purple-50/50"
              placeholder="Ej: 3855956688"
              disabled={mutation.isPending}
            />
            {errors.telefono && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.telefono.message}
              </p>
            )}
          </div>

          {/* Configuración de fecha de inicio (solo para sistema dinámico) */}
          {isDynamicTariff && (
            <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-200">
              <Label
                htmlFor="fechaInicioMembresia"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Fecha de inicio de membresía
              </Label>
              <Input
                {...register("fechaInicioMembresia", {
                  required: usarFechaPersonalizada
                    ? "La fecha de inicio es requerida"
                    : false,
                })}
                type="date"
                className="w-full h-11 px-4 text-base border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-300 bg-blue-50/50"
                disabled={mutation.isPending}
                defaultValue={new Date().toISOString().split("T")[0]} // 👈 fecha de hoy por defecto
              />
            </div>
          )}

          {/* Checkbox primer pago mes siguiente */}
          <div className="bg-purple-50/50 p-4 rounded-lg border border-purple-200">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-900 mb-2">
                Estado del pago del mes actual
                <div className="relative group ml-2 inline-block">
                  <HelpCircle className="w-4 h-4 text-purple-500 cursor-help" />
                  <div className="absolute hidden group-hover:block z-10 w-64 p-3 text-xs text-gray-700 bg-white border border-gray-200 rounded-lg shadow-lg -left-32 top-6">
                    <p className="font-medium mb-1">¿Qué significa esto?</p>
                    <p>
                      Aquí defines si el sistema debe crear el <b>pago</b> del
                      mes actual en estado{" "}
                      <span className="font-semibold">Pagado</span> o{" "}
                      <span className="font-semibold">Pendiente</span>.
                    </p>
                  </div>
                </div>
              </label>

              <div className="flex gap-6 mt-1">
                <label className="flex items-center text-sm text-gray-700 cursor-pointer">
                  <input
                    {...register("fechaInicioMembresia", { required: true })}
                    type="radio"
                    value="PAGADO"
                    className="w-4 h-4 text-purple-600 border-purple-300 focus:ring-purple-500"
                    disabled={mutation.isPending}
                  />
                  <span className="ml-2">Pagado</span>
                </label>

                <label className="flex items-center text-sm text-gray-700 cursor-pointer">
                  <input
                    {...register("fechaInicioMembresia", { required: true })}
                    type="radio"
                    value="PENDIENTE"
                    className="w-4 h-4 text-purple-600 border-purple-300 focus:ring-purple-500"
                    disabled={mutation.isPending}
                  />
                  <span className="ml-2">Pendiente</span>
                </label>
              </div>
            </div>
          </div>

          {/* Tarifa */}

          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
            <label
              htmlFor="tariffSelection"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tarifa
              <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              {...register(
                isDynamicTariff ? "dinamicaTarifaId" : "rangoTarifaId",
                {
                  required: "Debe seleccionar una opción de tarifa",
                }
              )}
              className="w-full h-12 px-4 pr-10 text-base border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 bg-white hover:border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed appearance-none"
              disabled={mutation.isPending}
            >
              <option value="" className="text-gray-500">
                Seleccione una opción
              </option>
              {uniqueTarifas.map((tarifa: any, i) => (
                <option
                  key={tarifa.id}
                  value={tarifa.id}
                  className="text-gray-800"
                >
                  {isDynamicTariff
                    ? `${tarifa.nombre} - $${tarifa.montoBase}`
                    : `${tarifa.nombre} - $${tarifa.monto}`}
                </option>
              ))}
            </select>

            {(errors.rangoTarifaId || errors.dinamicaTarifaId) && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.rangoTarifaId?.message ||
                  errors.dinamicaTarifaId?.message}
              </p>
            )}
            <p className="mt-2 text-xs text-gray-600">
              {isDynamicTariff
                ? "Selecciona la configuración dinámica que se aplicará a este usuario"
                : "Selecciona el rango de tarifa según el día del mes en que pagará"}
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={mutation.isPending || showSuccess}
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.01] disabled:transform-none text-base disabled:cursor-not-allowed flex items-center justify-center"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="animate-spin mr-2 w-5 h-5" />
                  Agregando Usuario...
                </>
              ) : showSuccess ? (
                <>
                  <CheckCircle className="mr-2 w-5 h-5" />
                  ¡Usuario Agregado!
                </>
              ) : (
                <>
                  <User className="mr-2 w-5 h-5" />
                  Agregar Usuario
                </>
              )}
            </button>
          </div>
        </form>

        {/* Error State */}
        {mutation.isError && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start animate-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Error al agregar usuario</p>
              <p className="text-sm">
                {mutation.error?.message || "Ha ocurrido un error inesperado"}
              </p>
            </div>
          </div>
        )}

        {/* Success State */}
        {showSuccess && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-start animate-in slide-in-from-top-2 duration-300">
            <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">
                ¡Usuario agregado exitosamente!
              </p>
              <p className="text-sm">El modal se cerrará automáticamente...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
