"use client";

import type React from "react";
import type {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
} from "react-hook-form";
import { AlertCircle } from "lucide-react";

// Define la interfaz de props para este componente
interface PersonalInfoFormProps {
  register: UseFormRegister<any>; // Usamos 'any' para flexibilidad, pero idealmente sería RegisterFormData
  errors: FieldErrors<any>; // Usamos 'any' para flexibilidad
  watch: UseFormWatch<any>; // Usamos 'any' para flexibilidad
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  register,
  errors,
  watch,
}) => {
  const inputClasses =
    "w-full px-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm";

  return (
    <div className="bg-purple-50/50 rounded-2xl p-6 border border-purple-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center mr-2">
          <span className="text-white text-sm font-bold">1</span>
        </div>
        Información de la Empresa
      </h2>
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="nombre"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nombre Completo (Administrador)
            </label>
            <input
              type="text"
              id="nombre"
              {...register("nombre", {
                required: "El nombre del administrador es requerido",
                minLength: {
                  value: 3,
                  message: "El nombre debe tener al menos 3 caracteres",
                },
              })}
              className={inputClasses}
              placeholder="Tu nombre completo"
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.nombre.message as string}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="documento"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              DNI (Administrador)
            </label>
            <input
              type="text"
              id="documento"
              {...register("documento", {
                required: "El DNI es requerido",
                pattern: {
                  value: /^\d{8,10}$/,
                  message: "Ingrese un DNI válido (8-10 dígitos)",
                },
              })}
              className={inputClasses}
              placeholder="Tu DNI"
            />
            {errors.documento && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.documento.message as string}
              </p>
            )}
          </div>
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email (Administrador)
          </label>
          <input
            type="email"
            id="email"
            {...register("email", {
              required: "El email es requerido",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                message: "Ingrese un email válido",
              },
            })}
            className={inputClasses}
            placeholder="Tu email"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.email.message as string}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="nombreEmpresa"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Nombre de la Empresa
          </label>
          <input
            type="text"
            id="nombreEmpresa"
            {...register("nombreEmpresa", {
              required: "El nombre de la empresa es requerido",
            })}
            className={inputClasses}
            placeholder="Nombre de tu empresa"
          />
          {errors.nombreEmpresa && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.nombreEmpresa.message as string}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="telefono"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Teléfono (Administrador)
          </label>
          <input
            type="text"
            id="telefono"
            {...register("telefono", {
              required: "El teléfono es requerido",
              pattern: {
                value: /^[0-9]+$/,
                message: "Ingrese un número de teléfono válido",
              },
            })}
            className={inputClasses}
            placeholder="Tu número de teléfono"
          />
          {errors.telefono && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.telefono.message as string}
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              {...register("password", {
                required: "La contraseña es requerida",
                minLength: {
                  value: 8,
                  message: "La contraseña debe tener al menos 8 caracteres",
                },
              })}
              className={inputClasses}
              placeholder="Tu contraseña"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.password.message as string}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="confirm_password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirmar Contraseña
            </label>
            <input
              type="password"
              id="confirm_password"
              {...register("confirm_password", {
                required: "Debe confirmar la contraseña",
                validate: (value) =>
                  value === watch("password") || "Las contraseñas no coinciden",
              })}
              className={inputClasses}
              placeholder="Confirma tu contraseña"
            />
            {errors.confirm_password && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.confirm_password.message as string}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
