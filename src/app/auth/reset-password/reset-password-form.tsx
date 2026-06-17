"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader2, Lock, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

function ResetPasswordForm() {
  const params = useSearchParams();
  const linkError = params.get("error"); // "invalid" | "expired" — set by verify-reset-token

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const inputClasses =
    "w-full px-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError(null);
    setMessage(null);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Token is NOT sent in the body — the server reads it from the httpOnly cookie
        body: JSON.stringify({ password }),
      });

      const body = await res.json();

      if (!res.ok) {
        setError(body?.error || "No se pudo cambiar la contraseña.");
        setLoading(false);
        return;
      }

      setMessage(
        "Contraseña actualizada correctamente. Redirigiendo al login...",
      );
      setSuccess(true);
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 2500);
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error inesperado.");
    }

    setLoading(false);
  }

  // Show error screen when verify-reset-token redirected with ?error=
  if (linkError) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-red-100 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Enlace inválido
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {linkError === "expired"
              ? "El enlace de restablecimiento ha expirado. Solicita uno nuevo."
              : "El enlace de restablecimiento no es válido o ya fue utilizado."}
          </p>
          <Link
            href="/auth/forgot-password"
            className="inline-block px-6 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            Solicitar nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-purple-100">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6 text-purple-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Restablecer contraseña
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Ingresa tu nueva contraseña para continuar.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start mb-4">
            <AlertCircle className="w-5 h-5 mr-2 mt-0.5 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-start">
            <CheckCircle className="w-5 h-5 mr-2 mt-0.5 shrink-0" />
            <span className="text-sm">{message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nueva contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                disabled={loading}
                className={inputClasses}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar contraseña
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contraseña"
                required
                disabled={loading}
                className={inputClasses}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-medium rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                "Restablecer contraseña"
              )}
            </button>

            <p className="text-center text-sm text-gray-500">
              <Link
                href="/auth/login"
                className="text-purple-600 hover:underline"
              >
                Volver al login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPasswordForm;
