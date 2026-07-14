import { User, Calendar, Fingerprint, MapPin, Zap } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const UserHeader = ({ data, isDynamicTariff, tarifaActual }: any) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-sm mb-6">
      {/* Decoración sutil de fondo */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50" />

      <div className="p-5 flex flex-col sm:flex-row items-center sm:items-start gap-5">
        {/* Avatar / Icono */}
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
            <User className="w-10 h-10 text-white" />
          </div>
          {isDynamicTariff && (
            <div
              className="absolute -bottom-2 -right-2 bg-amber-100 text-amber-700 p-1.5 rounded-lg border border-amber-200 shadow-sm"
              title="Tarifa Dinámica"
            >
              <Zap className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Información Principal */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold text-gray-800 capitalize">
              {data.nombre} {data.apellido}
            </h1>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border self-center
              ${data.estaActivo ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"}`}
            >
              {data.estaActivo ? "Activo" : "Inactivo"}
            </span>
          </div>

          {/* Grid de Metadatos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-500">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Fingerprint className="w-4 h-4 text-gray-400" />
              <span>
                DNI:{" "}
                <span className="font-semibold text-gray-700">
                  {data.documento}
                </span>
              </span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>
                Ingreso:{" "}
                <span className="font-semibold text-gray-700">
                  {data.fechaInicioMembresia
                    ? format(new Date(data.fechaInicioMembresia), "PP", {
                        locale: es,
                      })
                    : "N/A"}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer del Header: Barra rápida de Tarifa */}
      <div className="bg-gray-50/80 px-5 py-3 border-t border-gray-100 flex justify-between items-center">
        <div className="text-[11px] uppercase tracking-wider font-bold text-gray-400">
          Tarifa Asignada
        </div>
        <div className="text-sm font-bold text-emerald-600">
          {tarifaActual || "Sin tarifa"}
        </div>
      </div>
    </div>
  );
};
