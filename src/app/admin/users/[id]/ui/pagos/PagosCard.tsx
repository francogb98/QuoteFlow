import {
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Edit,
  XCircle,
} from "lucide-react";

const estadosPago = [
  {
    value: "PAGADO",
    label: "Pagado",
    icon: CheckCircle,
    color: "emerald",
  },
  {
    value: "PENDIENTE",
    label: "Pendiente",
    icon: Clock,
    color: "amber",
  },
  {
    value: "VENCIDO",
    label: "Vencido",
    icon: XCircle,
    color: "red",
  },
];

const getStatusConfig = (estado: any) => {
  const config = estadosPago.find((e) => e.value === estado);
  return config || estadosPago[1]; // fallback to PENDIENTE
};

export const PagosCard = ({ pago, handleEditPayment }: any) => {
  const statusConfig = getStatusConfig(pago.estado);
  return (
    <div
      key={pago.id}
      className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
    >
      {/* Decoración de fondo */}
      <div
        className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-${statusConfig.color}-100/50 to-${statusConfig.color}-200/50 rounded-full -translate-y-10 translate-x-10`}
      ></div>

      <div className="relative">
        {/* Header con monto y botón editar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">
                ${pago.monto.toFixed(2)}
              </span>
              <p className="text-xs text-gray-500">
                {pago.mes}/{pago.año}
              </p>
            </div>
          </div>
        </div>

        {/* Estado */}
        <div className="mb-4">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
              statusConfig.color === "emerald"
                ? "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 text-emerald-800"
                : statusConfig.color === "amber"
                ? "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 text-amber-800"
                : "bg-gradient-to-r from-red-50 to-red-50 border-red-200 text-red-800"
            }`}
          >
            <statusConfig.icon className="w-3 h-3" />
            {statusConfig.label}
          </span>
        </div>

        {/* Información del pago */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            {new Date(pago.fecha).toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
            {pago.metodo || "No especificado"}
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => handleEditPayment(pago)}
            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-xs font-medium rounded-lg shadow-sm hover:shadow-md transform hover:scale-[1.02] transition-all duration-300"
            title="Editar pago"
          >
            <Edit className="w-3 h-3" />
            Editar
          </button>
        </div>
      </div>
    </div>
  );
};
