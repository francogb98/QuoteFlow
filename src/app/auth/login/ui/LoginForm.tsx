"use client";

// Actualiza la importación para apuntar a la nueva ubicación de la acción
import { login } from "@/actions/auth/login"; // Cambiado de 'authenticate' a 'login'
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, AlertCircle } from "lucide-react"; // Asegúrate de que AlertCircle esté importado

interface LoginFormData {
  documento: string;
  password: string;
}

export const LoginForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);
    try {
      // Llama a la acción de servidor 'login'
      const response = await login(data.documento, data.password);

      if (response.ok) {
        router.push("/admin/home");
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

  const inputClasses =
    "w-full px-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm";

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
          />
          {errors.documento && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.documento.message}
            </p>
          )}
        </div>
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
            })}
            className={inputClasses}
            placeholder="Ingresa tu contraseña"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.password.message}
            </p>
          )}
        </div>
      </div>
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      {/* Botón principal - Verde esmeralda para acción de login */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Procesando...
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
      {/* Botón secundario - Purple/violet para navegación */}
      <Button
        variant="outline"
        className="w-full border-purple-200 text-purple-600 hover:bg-purple-50 py-3 rounded-xl font-medium transition-all duration-200 hover:border-purple-300 bg-transparent"
        asChild
      >
        <Link href="/auth/new-account">Crear Cuenta Nueva</Link>
      </Button>
    </form>
  );
};
