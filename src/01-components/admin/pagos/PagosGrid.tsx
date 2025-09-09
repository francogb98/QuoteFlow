"use client";
import { useState, useMemo } from "react";
import { getPagos } from "@/01-actions/admin/pago/getPagos";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle, Users, Search } from "lucide-react";
import { PagosCard } from "./PagosCard";
import { DataTable } from "@/components/DataTable"; // Import DataTable

function capitalize(s: any) {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const PagosGrid = () => {
  const [filter, setFilter] = useState("PENDIENTE");
  const [searchTerm, setSearchTerm] = useState("");

  const pagosQuery = useQuery({
    queryKey: ["pagos", filter],
    queryFn: async () => {
      const result = await getPagos(filter);
      if (!result.ok) {
        throw new Error(result.error || "Error al cargar pagos");
      }
      //@ts-ignore
      return result;
    },
  });

  const allPayments = useMemo(() => {
    if (!pagosQuery.data?.adminUsers?.usuarios) return [];
    return pagosQuery.data.adminUsers.usuarios
      .flatMap((user: any) =>
        user.pagos.map((pago: any) => ({
          ...pago,
          userName: `${user.nombre} ${user.apellido}`,
          userDni: user.documento,
        }))
      )
      .sort(
        (a: any, b: any) => (b.comprobante ? 1 : 0) - (a.comprobante ? 1 : 0)
      );
  }, [pagosQuery.data]);

  const filteredPayments = useMemo(() => {
    let payments = allPayments;
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      payments = payments.filter(
        (pago: any) =>
          pago.userName.toLowerCase().includes(lowerCaseSearchTerm) ||
          pago.userDni.includes(lowerCaseSearchTerm)
      );
    }
    return payments;
  }, [allPayments, searchTerm]);

  const paymentsWithVoucherCount = useMemo(() => {
    return allPayments.filter((pago: any) => pago.comprobante).length;
  }, [allPayments]);

  const sections = [
    {
      title: "Pendientes",
      state: "PENDIENTE",
      count: allPayments.length,
    },
    { title: "Pagados", state: "PAGADO", count: allPayments.length },
    {
      title: "Rechazados",
      state: "RECHAZADO",
      count: allPayments.length,
    },
    { title: "Vencidos", state: "VENCIDO", count: allPayments.length },
  ];

  return (
    <div className="space-y-8">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative w-full sm:w-auto flex-grow">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
          />
        </div>

        <div className="w-full sm:w-auto flex-shrink-0 flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {sections.map(({ title, state, count }) => (
            <div key={state} className="relative">
              <button
                onClick={() => {
                  setFilter(state);
                  setSearchTerm(""); // Reset search term when changing filter
                }}
                className={`
                  relative px-4 py-2 rounded-lg text-sm font-semibold transition-colors
                  ${
                    filter === state
                      ? "bg-purple-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                {title}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Grid */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2 flex items-center gap-2">
          <span>{capitalize(filter.toLowerCase())}</span>
          {filter === "PENDIENTE" && paymentsWithVoucherCount > 0 && (
            <span className="h-6 w-6 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold ring-2 ring-white">
              {paymentsWithVoucherCount}
            </span>
          )}
          {searchTerm && (
            <span className="text-gray-500 font-normal ml-2 text-lg">
              ({filteredPayments.length} resultados)
            </span>
          )}
        </h2>

        <DataTable
          data={filteredPayments}
          isPending={pagosQuery.isPending}
          isError={pagosQuery.isError}
          error={
            pagosQuery.error ||
            (pagosQuery.data && !pagosQuery.data.ok
              ? new Error(pagosQuery.data.error || "Error al cargar pagos")
              : null)
          }
          emptyMessage="No se encontraron pagos con los criterios de búsqueda."
          gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          renderItem={(pago: any) => (
            <PagosCard key={pago.id} pago={pago} userName={pago.userName} />
          )}
        />
      </div>
    </div>
  );
};
