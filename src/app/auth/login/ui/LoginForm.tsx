"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, AlertCircle, CheckCircle, EyeOff, Eye } from "lucide-react";
import { login } from "@/01-actions/auth/login";
import { Button } from "@/components/ui/button";

interface LoginFormData {
  documento: string;
  password: string;
}

export const LoginForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await login(data.documento, data.password);

      if (response.ok) {
        // Mostrar estado de éxito
        setSuccess(true);

        // Redirigir después de mostrar el éxito
        setTimeout(() => {
          router.push("/admin/home");
        }, 1500);
      } else {
        setError(
          response.error ||
            "Credenciales incorrectas. Por favor, inténtalo de nuevo."
        );
      }
    } catch (err) {
      console.error("Error inesperado durante el inicio de sesión:", err);
      setError(
        "Ocurrió un error al iniciar sesión. Por favor, inténtalo más tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const inputClasses =
    "w-full px-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm";

  const passwordInputClasses =
    "w-full px-4 py-3 pr-12 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm";
  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="documento"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            DNI
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
            placeholder="Ingresa tu DNI"
            disabled={loading || success}
          />
          {errors.documento && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.documento.message}
            </p>
          )}
        </div>

        <div className="relative">
          <input
            type={isPasswordVisible ? "text" : "password"}
            id="password"
            {...register("password", {
              required: "La contraseña es requerida",
            })}
            className={passwordInputClasses}
            placeholder="Ingresa tu contraseña"
            disabled={loading || success}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            disabled={loading || success}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={
              isPasswordVisible ? "Ocultar contraseña" : "Mostrar contraseña"
            }
          >
            {isPasswordVisible ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Alerta de error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Alerta de éxito - Versión simple */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center animate-in slide-in-from-top-2">
          <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <div>
            <div className="font-medium text-sm">
              ¡Sesión iniciada correctamente!
            </div>
            <div className="text-sm opacity-90 mt-1">Redirigiendo...</div>
          </div>
        </div>
      )}

      {/* Botón principal con estados */}
      <Button
        type="submit"
        disabled={loading || success}
        className={`w-full py-3 rounded-xl font-medium shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
          success
            ? "bg-green-600 hover:bg-green-700"
            : "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 hover:scale-[1.02] hover:shadow-xl"
        } text-white`}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Procesando...
          </>
        ) : success ? (
          <>
            <CheckCircle className="w-5 h-5 mr-2" />
            ¡Éxito! Redirigiendo...
          </>
        ) : (
          "Iniciar Sesión"
        )}
      </Button>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-purple-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white/80 text-gray-500 rounded-full">O</span>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full border-purple-200 text-purple-600 hover:bg-purple-50 py-3 rounded-xl font-medium transition-all duration-200 hover:border-purple-300 bg-transparent"
        disabled={loading || success}
        asChild
      >
        <Link href="/auth/new-account">Crear Cuenta Nueva</Link>
      </Button>
    </form>
  );
};
