import { AuditLog } from "@prisma/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Clock, CheckCircle2, DollarSign, CalendarDays } from "lucide-react";

interface CronLogCardProps {
  log: AuditLog;
}

export const CronLogCard = ({ log }: CronLogCardProps) => {
  let details;
  try {
    details = JSON.parse(log.details || "{}");
  } catch (error) {
    details = {};
  }

  const { metadata, resultados } = details;

  return (
    <div className="bg-purple-50 rounded-lg shadow-md p-6 border-l-4 border-purple-600">
      <div className="flex items-center justify-between border-b border-purple-200 pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <Clock size={20} className="text-purple-600" />
          <h3 className="text-lg font-bold text-purple-800">{log.action}</h3>
        </div>
        <span className="text-xs text-purple-500">
          {format(log.createdAt, "MMM d, yyyy h:mm a", { locale: es })}
        </span>
      </div>

      <div className="space-y-3 text-purple-700">
        <p className="flex justify-between items-center text-sm">
          <span className="font-semibold">Tipo de Proceso:</span>
          <span className="bg-purple-100 px-2 py-0.5 rounded-full text-xs font-mono">
            {metadata?.tipoProceso || "N/A"}
          </span>
        </p>

        <p className="flex justify-between items-center text-sm">
          <span className="font-semibold">Ejecutado en:</span>
          <span className="text-xs">
            {metadata?.ejecutadoEl
              ? format(new Date(metadata.ejecutadoEl), "h:mm:ss a", {
                  locale: es,
                })
              : "N/A"}
          </span>
        </p>

        <p className="flex justify-between items-center text-sm">
          <span className="font-semibold">Duración:</span>
          <span className="text-xs">
            {metadata?.tiempoEjecucionMs
              ? `${metadata.tiempoEjecucionMs} ms`
              : "N/A"}
          </span>
        </p>

        {resultados && (
          <div className="border-t border-purple-200 pt-3 mt-3 space-y-2">
            <p className="text-sm font-semibold text-purple-800">Resultados:</p>
            <ul className="text-xs space-y-1">
              <li className="flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <DollarSign size={14} /> <span>Pagos vencidos:</span>
                </span>
                <span className="font-bold">
                  {resultados.pagosVencidos || 0}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <CheckCircle2 size={14} /> <span>Recargos aplicados:</span>
                </span>
                <span className="font-bold">
                  {resultados.recargosAplicados || 0}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <CalendarDays size={14} /> <span>Pagos generados:</span>
                </span>
                <span className="font-bold">
                  {resultados.pagosFuturosGenerados || 0}
                </span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
