"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Download } from "lucide-react";

import { getPagos } from "@/actions/admin/pago/getPagos";
import { downloadCsv } from "@/lib/utils/csv";
import { PagosTable } from "./PagosTable";
import { ComprobanteModal } from "./ComprobanteModal";
import { EditPaymentStatusModal } from "./EditPaymentStatusModal";

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const PagosGrid = () => {
  const [filter, setFilter] = useState<
    "PENDIENTE" | "PAGADO" | "RECHAZADO" | "VENCIDO"
  >("PENDIENTE");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPago, setSelectedPago] = useState<any | null>(null);
  const [voucherPago, setVoucherPago] = useState<any | null>(null);

  const pagosQuery = useQuery({
    queryKey: ["pagos", filter],
    queryFn: async () => {
      const res = await getPagos(filter);
      if (!res.ok) throw new Error(res.error || "Error al cargar pagos");
      return res;
    },
  });

  /** Normalizamos pagos incluyendo el ID del usuario para el Panel Global */
  const allPayments = useMemo(() => {
    if (!pagosQuery.data?.adminUsers?.usuarios) return [];

    return pagosQuery.data.adminUsers.usuarios.flatMap((user: any) =>
      user.pagos.map((pago: any) => ({
        ...pago,
        usuarioId: user.id, // <--- IMPORTANTE: Agregamos el ID para el store global
        userName: `${user.nombre} ${user.apellido}`,
        userDni: user.documento,
      })),
    );
  }, [pagosQuery.data]);

  /** Filtro por búsqueda */
  const filteredPayments = useMemo(() => {
    if (!searchTerm) return allPayments;

    const term = searchTerm.toLowerCase();
    return allPayments.filter(
      (pago: any) =>
        pago.userName.toLowerCase().includes(term) ||
        pago.userDni.includes(term),
    );
  }, [allPayments, searchTerm]);

  const sections = [
    { label: "Pendientes", value: "PENDIENTE" },
    { label: "Pagados", value: "PAGADO" },
    { label: "Rechazados", value: "RECHAZADO" },
    { label: "Vencidos", value: "VENCIDO" },
  ];

  const handleExportCsv = () => {
    const rows = filteredPayments.map((pago: any) => ({
      Usuario: pago.userName,
      DNI: pago.userDni,
      Monto: pago.monto,
      Metodo: pago.metodo,
      Estado: pago.estado,
      Periodo: pago.mes ? `${pago.mes}/${pago.año}` : "",
      Fecha: pago.fecha ? new Date(pago.fecha).toLocaleDateString("es-AR") : "",
    }));
    downloadCsv(rows, `pagos_${filter.toLowerCase()}.csv`);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 bg-white p-4 rounded-xl border">
        {/* BUSCADOR */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* FILTROS */}
        <div className="flex gap-2 flex-wrap items-center">
          {sections.map((s) => (
            <button
              key={s.value}
              onClick={() => {
                setFilter(s.value as any);
                setSearchTerm("");
              }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition
                ${
                  filter === s.value
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }
              `}
            >
              {s.label}
            </button>
          ))}
          <button
            onClick={handleExportCsv}
            disabled={filteredPayments.length === 0}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ml-auto"
            title="Exportar a CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* TITULO */}
      <h2 className="text-xl font-bold text-gray-800">
        {capitalize(filter.toLowerCase())}
        {searchTerm && (
          <span className="ml-2 text-sm text-gray-500">
            ({filteredPayments.length} resultados)
          </span>
        )}
      </h2>

      {/* TABLA: Ahora recibe los pagos con el campo usuarioId */}
      <PagosTable
        pagos={filteredPayments}
        onViewVoucher={(pago) => setVoucherPago(pago)}
        onEditStatus={(pago) => setSelectedPago(pago)}
      />

      <ComprobanteModal
        pago={voucherPago}
        onClose={() => setVoucherPago(null)}
        onEditStatus={(pago) => {
          setVoucherPago(null);
          setSelectedPago(pago);
        }}
      />

      <EditPaymentStatusModal
        isOpen={!!selectedPago}
        onOpenChange={() => setSelectedPago(null)}
        pagoId={selectedPago?.id}
        userName={selectedPago?.userName}
      />
    </div>
  );
};
