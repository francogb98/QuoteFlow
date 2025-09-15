"use client";

import {
  User,
  Hash,
  Calendar,
  Shield,
  Phone,
  UserCheck,
  Save,
  Loader2,
  Mail,
  DollarSign,
  CalendarDays,
} from "lucide-react";
import { StatusChangeAlert } from "./StatusChangeAlert";

interface UserFormProps {
  formData: any;
  originalData: any;
  handleChange: (e: any) => void;
  handleSubmit: (e: any) => void;
  isLoading: boolean;
  tarifasDisponibles: any;
  tarifaActual: any;
}

const formatDateForArgentina = (date: Date | string | null): string => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Ensure we're working with a valid date
  if (isNaN(dateObj.getTime())) return "";

  // Get the date in Argentina timezone and format for input
  // Using UTC methods to avoid browser timezone interference
  const year = dateObj.getUTCFullYear();
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export function UserForm({
  formData,
  originalData,
  handleChange,
  handleSubmit,
  isLoading,
  tarifasDisponibles,
  tarifaActual,
}: UserFormProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-50 to-emerald-50 p-6 border-b border-purple-100">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <UserCheck className="w-5 h-5 mr-2 text-purple-600" />
          Información Personal
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          Actualiza los datos del usuario
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Nombre
            </label>
            <input
              type="text"
              name="nombre"
              value={formData?.nombre || ""}
              onChange={handleChange}
              className="w-full h-11 px-4 text-base border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-300 placeholder:text-gray-400 bg-purple-50/50"
              placeholder="Ingrese el nombre"
            />
          </div>

          {/* Apellido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Apellido
            </label>
            <input
              type="text"
              name="apellido"
              value={formData?.apellido || ""}
              onChange={handleChange}
              className="w-full h-11 px-4 text-base border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-300 placeholder:text-gray-400 bg-purple-50/50"
              placeholder="Ingrese el apellido"
            />
          </div>

          {/* Documento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Hash className="w-4 h-4 inline mr-1" />
              Documento
            </label>
            <input
              type="text"
              name="documento"
              value={formData?.documento || ""}
              onChange={handleChange}
              className="w-full h-11 px-4 text-base border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-300 placeholder:text-gray-400 bg-purple-50/50"
              placeholder="Ej: 12345678"
            />
          </div>

          {/* Edad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Edad
            </label>
            <input
              type="number"
              name="edad"
              value={formData?.edad || ""}
              onChange={handleChange}
              className="w-full h-11 px-4 text-base border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-300 placeholder:text-gray-400 bg-purple-50/50"
              placeholder="Ej: 25"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Teléfono
            </label>
            <input
              type="text"
              name="telefono"
              value={formData?.telefono || ""}
              onChange={handleChange}
              className="w-full h-11 px-4 text-base border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-300 placeholder:text-gray-400 bg-purple-50/50"
              placeholder="Ej: +54 11 1234-5678"
            />
          </div>

          {/* Correo Electrónico */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Correo Electrónico{" "}
              <span className="text-gray-400">(opcional)</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData?.email || ""}
              onChange={handleChange}
              className="w-full h-11 px-4 text-base border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-300 placeholder:text-gray-400 bg-purple-50/50"
              placeholder="Ej: usuario@correo.com"
            />
            <p className="mt-1 text-xs text-gray-500">
              Este correo se usará para enviar notificaciones de pago y
              recordatorios.
            </p>
          </div>

          {/* Estado del Usuario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Shield className="w-4 h-4 inline mr-1" />
              Estado del Usuario
            </label>
            <select
              name="estado"
              value={formData?.estado || "ACTIVO"}
              onChange={handleChange}
              className="w-full h-11 px-4 text-base border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-300 bg-purple-50/50"
            >
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Los usuarios inactivos no podrán acceder al sistema
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CalendarDays className="w-4 h-4 inline mr-1" />
              Fecha de Inicio de Membresía
            </label>
            <input
              type="date"
              name="fechaInicioMembresia"
              value={formatDateForArgentina(formData?.fechaInicioMembresia)}
              onChange={handleChange}
              className="w-full h-11 px-4 text-base border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-300 placeholder:text-gray-400 bg-purple-50/50"
            />
            <p className="mt-1 text-xs text-gray-500">
              Fecha en que el usuario comenzó su membresía (zona horaria de
              Argentina)
            </p>
          </div>

          {/* Tarifa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Tarifa
            </label>
            <select
              name="tarifa"
              value={formData?.tarifa || tarifaActual || ""}
              onChange={handleChange}
              className="w-full h-11 px-4 text-base border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-300 bg-purple-50/50"
            >
              <option value="">Seleccionar tarifa</option>
              {tarifasDisponibles.map((tarifa: any) => (
                <option key={tarifa.id} value={tarifa.id}>
                  {tarifa.nombre}
                </option>
              ))}
            </select>
            {formData?.tarifa && formData.tarifa !== tarifaActual && (
              <p className="mt-1 text-xs text-blue-600">
                ⚠️ Tarifa será actualizada al guardar los cambios
              </p>
            )}
          </div>
        </div>

        <StatusChangeAlert
          currentStatus={originalData?.estado}
          newStatus={formData?.estado}
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:transform-none transition-all duration-300 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
