"use client";

import { Check, X, Eye, CreditCard } from "lucide-react";
import { useAdminPanelStore } from "@/lib/store/useAdminPanelStore";

interface Props {
  pagos: any[];
  onViewVoucher: (pago: any) => void;
  onEditStatus: (pago: any) => void;
}

export function PagosTable({ pagos, onViewVoucher, onEditStatus }: Props) {
  const openUser = useAdminPanelStore((s) => s.openUser);

  if (pagos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <CreditCard className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          No hay pagos en esta categoría
        </h3>
        <p className="text-sm text-gray-500 max-w-sm">
          Cuando tus usuarios realicen pagos, aparecerán aquí. También puedes
          buscar por nombre o DNI para filtrar resultados.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="p-3 text-left">Usuario</th>
            <th className="p-3">Monto</th>
            <th className="p-3">Método</th>
            <th className="p-3">Estado</th>
            <th className="p-3">Comprobante</th>
            <th className="p-3 text-center">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {pagos.map((pago) => (
            <tr key={pago.id} className="border-t hover:bg-gray-50">
              <td className="p-3">
                <div
                  className="group cursor-pointer"
                  onClick={() => pago.usuarioId && openUser(pago.usuarioId)}
                >
                  <div className="font-medium group-hover:text-purple-600 transition-colors">
                    {pago.userName}
                  </div>
                  <div className="text-xs text-gray-500">{pago.userDni}</div>
                </div>
              </td>

              <td className="p-3 font-semibold">
                ${pago.monto.toLocaleString("es-AR")}
              </td>

              <td className="p-3">{pago.metodo}</td>

              <td className="p-3">
                <EstadoBadge estado={pago.estado} />
              </td>

              <td className="p-3">
                {pago.comprobante ? (
                  <button
                    onClick={() => onViewVoucher(pago)}
                    className="text-purple-600 hover:underline flex items-center gap-1"
                  >
                    <Eye size={16} />
                    Ver
                  </button>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>

              <td className="p-3 flex justify-center gap-2">
                {(pago.estado === "PENDIENTE" ||
                  pago.metodo === "EFECTIVO") && (
                  <>
                    <button
                      onClick={() => onEditStatus(pago)}
                      className="text-green-600 hover:bg-green-50 p-1 rounded"
                      title="Aprobar"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => onEditStatus(pago)}
                      className="text-red-600 hover:bg-red-50 p-1 rounded"
                      title="Rechazar"
                    >
                      <X size={18} />
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EstadoBadge({ estado }: { estado: string }) {
  const map: any = {
    PENDIENTE: "bg-yellow-100 text-yellow-700",
    PAGADO: "bg-green-100 text-green-700",
    RECHAZADO: "bg-red-100 text-red-700",
    VENCIDO: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${map[estado]}`}
    >
      {estado}
    </span>
  );
}
