import { AuditLog } from "@prisma/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface LogCardProps {
  log: AuditLog;
}

export const LogCard = ({ log }: LogCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200">
      {/* Encabezado compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
        <h3 className="text-base font-semibold text-gray-800 leading-tight">
          <span className="text-blue-600 truncate">{log.action}</span>
        </h3>
        <span className="text-xs text-gray-500 mt-1 sm:mt-0 sm:ml-2 flex-shrink-0">
          {format(log.createdAt, "MMM d, yyyy h:mm a", { locale: es })}
        </span>
      </div>

      {/* Detalles del Log en filas compactas */}
      <div className="text-sm text-gray-600 space-y-1">
        {/* Entidad y ID */}
        <p className="flex items-center space-x-2">
          <span className="font-medium text-gray-700">Entidad:</span>
          <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-mono truncate">
            {log.entityType} ({log.entityId})
          </span>
        </p>

        {/* Administrador */}
        {log.administradorId && (
          <p className="flex items-center space-x-2">
            <span className="font-medium text-gray-700">Admin ID:</span>
            <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-mono truncate">
              {log.administradorId}
            </span>
          </p>
        )}

        {/* Detalles Adicionales */}
        {log.details && (
          <div className="mt-2 text-xs text-gray-600 border-t border-gray-100 pt-2">
            <p className="font-medium text-gray-700">Detalles:</p>
            <p className="truncate-2-lines">{log.details}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Necesitas agregar esta clase a tu archivo CSS principal si no usas un plugin de Tailwind
// @layer components {
//   .truncate-2-lines {
//     overflow: hidden;
//     display: -webkit-box;
//     -webkit-line-clamp: 2;
//     -webkit-box-orient: vertical;
//   }
// }
