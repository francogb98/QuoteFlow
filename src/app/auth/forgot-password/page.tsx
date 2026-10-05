"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [documento, setDocumento] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClasses =
    "w-full px-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!/^\d{8,10}$/.test(documento)) {
      setError("Ingrese un DNI válido (8-10 dígitos)");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documento }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(
          body?.error || "Ocurrió un error. Intenta nuevamente más tarde."
        );
        setLoading(false);
        return;
      }

      if (body?.redirect) {
        router.push(body.redirect);
        return;
      }
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error. Intenta nuevamente más tarde.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-purple-100">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Recuperar contraseña
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Ingresa tu DNI para restablecer tu contraseña.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start mb-4">
            <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <div>
            <label
              htmlFor="documento"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              DNI
            </label>
            <input
              id="documento"
              type="text"
              required
              value={documento}
              onChange={(e) =>
                setDocumento(e.target.value.replace(/\D/g, ""))
              }
              className={inputClasses}
              placeholder="Ej: 12345678"
              disabled={loading}
              maxLength={10}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-medium shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-500 to-green-600 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Verificando...
              </>
            ) : (
              "Restablecer contraseña"
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
