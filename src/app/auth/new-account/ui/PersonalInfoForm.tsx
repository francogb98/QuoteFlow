"use client";

import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import type React from "react";
import type {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
} from "react-hook-form";

interface PersonalInfoFormProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  watch: UseFormWatch<any>;
  disabled?: boolean;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  register,
  errors,
  watch,
  disabled = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Clases base para inputs
  const inputClasses = `w-full px-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm ${
    disabled ? "opacity-50 cursor-not-allowed" : ""
  }`;

  const passwordInputClasses = `${inputClasses} pr-12`;

  // Validación para nombres: solo letras, espacios y acentos básicos
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  // Validación para DNI (Argentina: 8 dígitos)
  const dniRegex = /^\d{8}$/;
  // Validación para teléfono (permite +, números, espacios y guiones)
  const phoneRegex = /^[\d\s+\-()]{10,20}$/;
  // Validación para contraseña: mínimo 8 caracteres, 1 mayúscula, 1 número
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,50}$/;

  return (
    <div className="bg-purple-50/50 rounded-2xl p-6 border border-purple-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center mr-2">
          <span className="text-white text-sm font-bold">1</span>
        </div>
        Información de la Empresa
      </h2>
      <div className="space-y-5">
        {/* Nombre del Administrador */}
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
            maxLength={30}
            {...register("nombre", {
              required: "El nombre es requerido",
              pattern: {
                value: nameRegex,
                message: "Solo se permiten letras y espacios",
              },
              minLength: {
                value: 3,
                message: "Mínimo 3 caracteres",
              },
            })}
            className={inputClasses}
            placeholder="Ej: María González"
            disabled={disabled}
          />
          {errors.nombre && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.nombre.message as string}
            </p>
          )}
        </div>

        {/* DNI */}
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
            maxLength={8}
            {...register("documento", {
              required: "El DNI es requerido",
              pattern: {
                value: dniRegex,
                message: "Debe tener 8 dígitos numéricos",
              },
            })}
            className={inputClasses}
            placeholder="Ej: 12345678"
            disabled={disabled}
          />
          {errors.documento && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.documento.message as string}
            </p>
          )}
        </div>

        {/* Email */}
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
            maxLength={50}
            {...register("email", {
              required: "El email es requerido",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Email inválido",
              },
            })}
            className={inputClasses}
            placeholder="ejemplo@empresa.com"
            disabled={disabled}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.email.message as string}
            </p>
          )}
        </div>

        {/* Nombre de la Empresa */}
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
            maxLength={30}
            {...register("nombreEmpresa", {
              required: "El nombre es requerido",
              pattern: {
                value: /^[\S]+$/, // Sin espacios
                message: "No se permiten espacios en este campo",
              },
              minLength: {
                value: 2,
                message: "Mínimo 2 caracteres",
              },
            })}
            className={inputClasses}
            placeholder="Ej: Mi Empresa S.A."
            disabled={disabled}
          />
          {errors.nombreEmpresa && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.nombreEmpresa.message as string}
            </p>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <label
            htmlFor="telefono"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Teléfono (Administrador)
          </label>
          <input
            type="tel"
            id="telefono"
            maxLength={20}
            {...register("telefono", {
              required: "El teléfono es requerido",
              pattern: {
                value: phoneRegex,
                message: "Formato inválido (ej: +54 11 1234-5678)",
              },
            })}
            className={inputClasses}
            placeholder="+54 11 1234-5678"
            disabled={disabled}
          />
          {errors.telefono && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.telefono.message as string}
            </p>
          )}
        </div>

        {/* Contraseña y Confirmación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                maxLength={20}
                {...register("password", {
                  required: "La contraseña es requerida",
                  pattern: {
                    value: passwordRegex,
                    message: "Mínimo 8 caracteres, 1 mayúscula y 1 número",
                  },
                })}
                className={passwordInputClasses}
                placeholder="••••••••"
                disabled={disabled}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={disabled}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
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
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirm_password"
                maxLength={20}
                {...register("confirm_password", {
                  required: "Confirma tu contraseña",
                  validate: (value) =>
                    value === watch("password") ||
                    "Las contraseñas no coinciden",
                })}
                className={passwordInputClasses}
                placeholder="••••••••"
                disabled={disabled}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={disabled}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                aria-label={
                  showConfirmPassword
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
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
