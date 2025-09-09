import Link from "next/link";
import {
  ArrowLeft,
  Settings,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface UserHeaderProps {
  data: any;
  isDynamicTariff: boolean;
}

export function UserHeader({ data, isDynamicTariff }: UserHeaderProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link
            href="/admin/users"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-lg transition-all duration-300 mr-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Lista
          </Link>
          <div className="flex items-center">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 capitalize">
                  {data?.nombre} {data?.apellido}
                </h1>
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                    data?.estado === "ACTIVO"
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "bg-red-100 text-red-800 border border-red-200"
                  }`}
                >
                  {data?.estado === "ACTIVO" ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  {data?.estado === "ACTIVO" ? "Activo" : "Inactivo"}
                </div>
              </div>
              {data?.configuracionTarifa && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                    <Settings className="w-3 h-3" />
                    <span>
                      Sistema:{" "}
                      {isDynamicTariff ? "Dinámico por fecha" : "Fijo mensual"}
                    </span>
                  </div>
                  {data.fechaInicioMembresia && isDynamicTariff && (
                    <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-md">
                      <Calendar className="w-3 h-3" />
                      <span>
                        Inicio:{" "}
                        {new Date(data.fechaInicioMembresia).toLocaleDateString(
                          "es-ES"
                        )}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
