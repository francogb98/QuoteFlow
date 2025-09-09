"use client";
import { useState } from "react";
import type React from "react";

import { useRouter } from "next/navigation";
import { Search, User, AlertCircle } from "lucide-react";

interface Props {
  empresa: string;
}

export const FormSearchUser = ({ empresa }: Props) => {
  const [documento, setDocumento] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!documento.trim()) {
      setError("Por favor ingresa tu número de DNI");
      return;
    }

    // Basic DNI validation (only numbers, 7-8 digits)
    const dniRegex = /^\d{7,8}$/;
    if (!dniRegex.test(documento.trim())) {
      setError("El DNI debe contener solo números (7-8 dígitos)");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Navigate to the user's payment page
      router.push(`/${empresa}/${documento.trim()}`);
    } catch (error) {
      setError("Error al buscar usuario. Por favor intenta nuevamente.");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-purple-100 p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Buscar Usuario
          </h2>
          <p className="text-gray-600">
            Ingresa tu DNI para consultar tus pagos
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="documento"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Número de DNI
            </label>
            <div className="relative">
              <input
                type="text"
                id="documento"
                value={documento}
                onChange={(e) => {
                  setDocumento(e.target.value);
                  setError("");
                }}
                placeholder="Ej: 12345678"
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                disabled={isLoading}
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Buscando...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Search className="w-4 h-4 mr-2" />
                Buscar mis pagos
              </div>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            ¿No encuentras tu información? Contacta al administrador de{" "}
            {empresa}
          </p>
        </div>
      </div>
    </div>
  );
};
