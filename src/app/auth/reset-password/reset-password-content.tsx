"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ResetPasswordContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params?.get("token") || "";
  const id = params?.get("id") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fieldError, setFieldError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputClasses =
    "w-full px-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm";

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,50}$/;

  useEffect(() => {
    if (!token || !id) setFieldError("Enlace inválido");
  }, [token, id]);

  function validateFields() {
    setPasswordError(null);
    setConfirmError(null);
    setFieldError(null);

    if (!passwordRegex.test(password)) {
      setPasswordError("Mínimo 8 caracteres, 1 mayúscula y 1 número");
      return false;
    }
    if (password !== confirm) {
      setConfirmError("Las contraseñas no coinciden");
      return false;
    }
    return true;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateFields()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, token, password }),
      });
      setLoading(false);
      if (res.ok) {
        setOk(true);
        setTimeout(() => router.push("/auth/login"), 1500);
      } else {
        const body = await res.json().catch(() => ({}));
        setFieldError(body?.error || "No se pudo restablecer");
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      setFieldError("Ocurrió un error. Intenta nuevamente más tarde.");
    }
  }

  if (ok) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-purple-100 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-50 rounded-full mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">
            Contraseña actualizada
          </h2>
          <p className="text-sm text-gray-500 mt-2">Redirigiendo al login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-purple-100">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Restablecer contraseña
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Ingresa una nueva contraseña para tu cuenta.
          </p>
        </div>

        {fieldError && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start mb-4">
            <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-sm">{fieldError}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={submit} noValidate>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nueva contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(null);
                }}
                className={inputClasses}
                placeholder="Al menos 8 caracteres"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
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
            {passwordError && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {passwordError}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirm"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirmar contraseña
            </label>
            <div className="relative">
              <input
                id="confirm"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  setConfirmError(null);
                }}
                className={inputClasses}
                placeholder="Repite la contraseña"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
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
            {confirmError && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {confirmError}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-medium shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-500 to-green-600 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              "Cambiar contraseña"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <Link href="/auth/login" className="text-purple-600 hover:underline">
            Volver al login
          </Link>
        </div>
      </div>
    </div>
  );
}
