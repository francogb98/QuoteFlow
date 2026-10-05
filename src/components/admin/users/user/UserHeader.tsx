import { User, Calendar, Fingerprint, Zap } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const UserHeader = ({ data, isDynamicTariff, tarifaActual }: any) => {
  return (
    <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-3 flex items-center gap-3">
        {/* Avatar compacto */}
        <div className="relative shrink-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          {isDynamicTariff && (
            <div className="absolute -bottom-1 -right-1 bg-amber-100 text-amber-700 p-0.5 rounded border border-amber-200">
              <Zap className="w-2.5 h-2.5" />
            </div>
          )}
        </div>

        {/* Info compacta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-semibold text-gray-800 truncate capitalize">
              {data.nombre} {data.apellido}
            </h1>
            <span
              className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium border
              ${data.estaActivo ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"}`}
            >
              {data.estaActivo ? "Activo" : "Inactivo"}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-[11px] text-gray-500">
            <span className="flex items-center gap-1">
              <Fingerprint className="w-3 h-3 text-gray-400" />
              DNI: <span className="font-medium text-gray-700">{data.documento}</span>
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-gray-400" />
              {data.fechaInicioMembresia
                ? format(new Date(data.fechaInicioMembresia), "PP", { locale: es })
                : "N/A"}
            </span>
          </div>
        </div>

        {/* Tarifa badge */}
        <div className="shrink-0 text-right">
          <div className="text-[9px] uppercase tracking-wider font-bold text-gray-400">Tarifa</div>
          <div className="text-xs font-bold text-emerald-600">
            {tarifaActual || "Sin tarifa"}
          </div>
        </div>
      </div>
    </div>
  );
};