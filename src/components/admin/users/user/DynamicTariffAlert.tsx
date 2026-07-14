import { Info } from "lucide-react";

interface DynamicTariffAlertProps {
  data: any;
}

export function DynamicTariffAlert({ data }: DynamicTariffAlertProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-medium text-blue-900 mb-1">
            Sistema de Tarifas Dinámico
          </h4>
          <p className="text-sm text-blue-800 mb-2">
            Este usuario utiliza el sistema dinámico basado en fecha de ingreso.
            Los pagos se calculan según:
          </p>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>
              • <strong>Monto base:</strong> $
              {data?.configuracionTarifa?.montoBase}
            </li>
            <li>
              • <strong>Días de gracia:</strong>{" "}
              {data?.configuracionTarifa?.diasGracia} días
            </li>
            <li>
              • <strong>Monto con recargo:</strong> $
              {data?.configuracionTarifa?.montoRecargo}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
