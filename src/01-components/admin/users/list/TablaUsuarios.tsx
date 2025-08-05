"use client";

import { SearchBar, PaginationControls, TableGrid } from "@/components/admin";
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Phone,
  Edit,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
} from "lucide-react";
import { TipoConfiguracionTarifa } from "@prisma/client";

const columnHelper = createColumnHelper();

const statusConfig = {
  PAGADO: {
    bg: "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200",
    text: "text-emerald-800",
    icon: <CheckCircle className="w-3 h-3" />,
    label: "Pagado",
  },
  PENDIENTE: {
    bg: "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200",
    text: "text-amber-800",
    icon: <Clock className="w-3 h-3" />,
    label: "Pendiente",
  },
  INACTIVO: {
    bg: "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200",
    text: "text-gray-800",
    icon: <XCircle className="w-3 h-3" />,
    label: "Inactivo",
  },
  VENCIDO: {
    bg: "bg-gradient-to-r from-red-50 to-red-50 border-red-200",
    text: "text-red-800",
    icon: <XCircle className="w-3 h-3" />,
    label: "Vencido",
  },
};

interface TablaUsuariosProps {
  usuarios: any[];
  filtradoPorMes: boolean;
  tipoConfiguracion?: string | null;
}

export const TablaUsuarios = ({
  usuarios,
  filtradoPorMes,
  tipoConfiguracion,
}: TablaUsuariosProps) => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);

  const isDynamicTariff =
    tipoConfiguracion === TipoConfiguracionTarifa.DINAMICA_POR_FECHA_INGRESO;

  // Función para obtener el estado del usuario basado en sus pagos
  const getUserStatus = (usuario: any) => {
    if (!usuario.pagos || usuario.pagos.length === 0) {
      return "INACTIVO";
    }

    // Si estamos filtrando por mes, usar el estado del pago de ese mes
    if (filtradoPorMes && usuario.pagos.length > 0) {
      const pago = usuario.pagos[0];

      // Para sistema dinámico, verificar si está vencido basado en fechaVencimiento
      if (isDynamicTariff && pago.fechaVencimiento) {
        const now = new Date();
        const fechaVencimiento = new Date(pago.fechaVencimiento);

        if (pago.estado === "PAGADO") {
          return "PAGADO";
        } else if (now > fechaVencimiento) {
          return "VENCIDO";
        } else {
          return "PENDIENTE";
        }
      }

      return pago.estado;
    }

    // Si no filtramos por mes, determinar estado general
    const pagosPendientes = usuario.pagos.filter(
      (p: any) => p.estado === "PENDIENTE"
    );
    const pagosVencidos = usuario.pagos.filter(
      (p: any) => p.estado === "VENCIDO"
    );

    if (pagosVencidos.length > 0) return "VENCIDO";
    if (pagosPendientes.length > 0) return "PENDIENTE";
    return "PAGADO";
  };

  // Función para obtener información de fecha de vencimiento
  const getPaymentInfo = (usuario: any) => {
    if (!usuario.pagos || usuario.pagos.length === 0) return null;

    const pago = usuario.pagos[0];
    if (!pago) return null;

    if (isDynamicTariff && pago.fechaVencimiento) {
      const fechaVencimiento = new Date(pago.fechaVencimiento);
      return {
        fecha: fechaVencimiento.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        monto: pago.monto,
      };
    }

    return {
      fecha: `${pago.mes}/${pago.año}`,
      monto: pago.monto,
    };
  };

  // Columnas base que siempre se muestran
  const baseColumns = [
    //@ts-ignore
    columnHelper.accessor((row) => `${row.apellido} ${row.nombre}`, {
      id: "nombreCompleto",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-purple-600 transition-colors group"
        >
          Nombre
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="w-3 h-3 text-purple-500" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="w-3 h-3 text-purple-500" />
          ) : (
            <ArrowUpDown className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
          )}
        </button>
      ),
      cell: (info) => (
        <div className="flex items-center">
          <span className="font-medium capitalize underline text-blue-600">
            {/* @ts-ignore */}
            <Link href={`/admin/users/${info.row.original.id}`}>
              {info.getValue()}
            </Link>
          </span>
        </div>
      ),
    }),
    columnHelper.accessor("documento", {
      header: () => (
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Documento
        </span>
      ),
      cell: (info) => (
        <span className="text-gray-700 font-mono bg-gray-50 px-2 py-1 rounded text-sm">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("telefono", {
      header: () => (
        <span className="hidden sm:inline text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Teléfono
        </span>
      ),
      cell: (info) => (
        <div className="hidden sm:flex items-center text-gray-600">
          {info.getValue() ? (
            <>
              <Phone className="w-3 h-3 mr-1 text-gray-400" />
              <span className="text-sm">{info.getValue()}</span>
            </>
          ) : (
            <span className="text-gray-400 text-sm">-</span>
          )}
        </div>
      ),
      meta: {
        className: "hidden md:table-cell",
      },
    }),
  ];

  // Columna de información de pago (para sistema dinámico cuando se filtra por mes)
  const paymentInfoColumn = columnHelper.accessor(
    (row) => getPaymentInfo(row),
    {
      id: "paymentInfo",
      header: () => (
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
          {isDynamicTariff ? "Vencimiento" : "Período"}
        </span>
      ),
      cell: (info) => {
        const paymentInfo = info.getValue();
        if (!paymentInfo) {
          return <span className="text-gray-400 text-sm">-</span>;
        }

        return (
          <div className="flex flex-col">
            <div className="flex items-center text-sm text-gray-700">
              <Calendar className="w-3 h-3 mr-1 text-gray-400" />
              {paymentInfo.fecha}
            </div>
            <span className="text-xs text-gray-500">${paymentInfo.monto}</span>
          </div>
        );
      },
    }
  );

  // Columna de estado (solo se muestra cuando se filtra por mes)
  const estadoColumn = columnHelper.accessor((row) => getUserStatus(row), {
    id: "estado",
    header: ({ column }) => (
      <button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-purple-600 transition-colors group"
      >
        Estado
        {column.getIsSorted() === "asc" ? (
          <ArrowUp className="w-3 h-3 text-purple-500" />
        ) : column.getIsSorted() === "desc" ? (
          <ArrowDown className="w-3 h-3 text-purple-500" />
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
        )}
      </button>
    ),
    cell: (info) => {
      const estado = info.getValue();
      console.log(estado);
      // @ts-ignore
      const config = statusConfig[estado] || statusConfig.PENDIENTE;
      if (!config) {
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-gray-50 text-gray-600">
            <Clock className="w-3 h-3" />
            Sin estado
          </span>
        );
      }

      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${config.bg} ${config.text}`}
        >
          {config.icon}
          {config.label}
        </span>
      );
    },
    sortingFn: (rowA, rowB, columnId) => {
      const estadoA =
        // @ts-ignore
        statusConfig[rowA.getValue(columnId)]?.label || "Sin estado";
      const estadoB =
        // @ts-ignore
        statusConfig[rowB.getValue(columnId)]?.label || "Sin estado";
      return estadoA.localeCompare(estadoB);
    },
  });

  // Columna de acciones (siempre se muestra al final)
  const actionColumn = columnHelper.accessor("id", {
    header: () => (
      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
        Acciones
      </span>
    ),
    cell: (info) => (
      <Link
        href={`/admin/users/${info.getValue()}`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-xs font-medium rounded-lg shadow-sm hover:shadow-md transform hover:scale-[1.02] transition-all duration-300"
        title="Editar usuario"
      >
        <Edit className="w-3 h-3" />
        Editar
      </Link>
    ),
  });

  const columns = [...baseColumns];

  if (filtradoPorMes) {
    if (isDynamicTariff) {
      // @ts-ignore
      columns.push(paymentInfoColumn);
    }
    columns.push(estadoColumn);
  }

  columns.push(actionColumn);

  const table = useReactTable({
    data: usuarios || [],
    // @ts-ignore
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination,
      globalFilter,
      sorting,
    },
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    // @ts-ignore
    onSortingChange: setSorting,
  });

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
      {/* Header con búsqueda */}
      <div className="bg-gradient-to-r from-purple-50 to-emerald-50 p-6 border-b border-purple-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Usuarios</h3>
            <p className="text-sm text-gray-600">
              {table.getFilteredRowModel().rows.length} de{" "}
              {usuarios?.length || 0} usuarios
              {filtradoPorMes && (
                <span>
                  {" "}
                  con pagos {isDynamicTariff ? "que vencen" : ""} en el período
                  seleccionado
                </span>
              )}
            </p>
            {isDynamicTariff && filtradoPorMes && (
              <p className="text-xs text-blue-600 mt-1">
                Sistema dinámico: mostrando usuarios con fechas de vencimiento
                en el período
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <SearchBar
              value={globalFilter ?? ""}
              onChange={setGlobalFilter}
              placeholder="Buscar usuarios..."
            />
            <PaginationControls table={table} showGoToPage showPageSize />
          </div>
        </div>
      </div>
      {/* Tabla */}
      <div className="overflow-x-auto">
        <TableGrid table={table} />
      </div>
      {/* Footer con paginación */}
      <div className="bg-gray-50 p-4 border-t border-gray-200">
        <PaginationControls table={table} showGoToPage showPageSize />
      </div>
    </div>
  );
};
