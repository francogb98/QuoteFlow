"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, AlertCircle, CheckCircle, EyeOff, Eye } from "lucide-react";
import { login } from "@/actions/auth/login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
        setSuccess(true);

        setTimeout(() => {
          const targetUrl = response.url || "/admin/home";
          router.push(targetUrl);
          router.refresh();
        }, 600);
      } else {
        setError(
          response.error ||
            "Credenciales incorrectas. Por favor, inténtalo de nuevo.",
        );
      }
    } catch (err) {
      console.error("Error inesperado durante el inicio de sesión:", err);
      setError(
        "Ocurrió un error al iniciar sesión. Por favor, inténtalo más tarde.",
      );
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-4">
        <div>
          <Label htmlFor="documento" className="mb-2 block">
            DNI
          </Label>
          <Input
            type="text"
            id="documento"
            {...register("documento", {
              required: "El DNI es requerido",
              pattern: {
                value: /^\d{8,10}$/,
                message: "Ingrese un DNI válido (8-10 dígitos)",
              },
            })}
            placeholder="Ingresa tu DNI"
            disabled={loading || success}
          />
          {errors.documento && (
            <p className="mt-1 text-sm text-destructive flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.documento.message}
            </p>
          )}
        </div>

        <div className="relative">
          <Label htmlFor="password" className="mb-2 block">
            Contraseña
          </Label>
          <Input
            type={isPasswordVisible ? "text" : "password"}
            id="password"
            {...register("password", {
              required: "La contraseña es requerida",
            })}
            placeholder="Ingresa tu contraseña"
            disabled={loading || success}
            className="pr-12"
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            disabled={loading || success}
            className="absolute inset-y-0 right-0 top-7 flex items-center pr-3 text-muted-foreground hover:text-foreground focus:outline-none transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-start animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 mr-2 mt-0.5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Alerta de éxito */}
      {success && (
        <div className="p-4 bg-accent/10 border border-accent/20 text-accent rounded-xl flex items-center animate-in slide-in-from-top-2">
          <CheckCircle className="w-5 h-5 mr-3 shrink-0" />
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
            ? "bg-accent hover:bg-accent/90 text-accent-foreground"
            : "bg-accent hover:bg-accent/90 text-accent-foreground hover:scale-[1.02] hover:shadow-xl"
        }`}
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
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-background text-muted-foreground rounded-full">O</span>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full py-3 rounded-xl font-medium transition-all duration-200"
        disabled={loading || success}
        asChild
      >
        <Link href="/auth/new-account">Crear Cuenta Nueva</Link>
      </Button>
    </form>
  );
};
