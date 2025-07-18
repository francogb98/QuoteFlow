"use client";

import { SearchBar, PaginationControls, TableGrid } from "@/components/admin";
import type { Usuario } from "@prisma/client"; // Importa el tipo Usuario
import type { $Enums } from "@prisma/client"; // Importa $Enums para el tipo Estado

import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  type SortingState,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import { useState } from "react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { IoCardOutline } from "react-icons/io5";

interface Props {
  usuarios: Usuario[];
}

const columnHelper = createColumnHelper<Usuario>();

const statusBadgeClasses: Record<$Enums.Estado, string> = {
  PAGADO: "bg-green-100 text-green-800",
  PENDIENTE: "bg-yellow-100 text-yellow-800",
  INACTIVO: "bg-gray-100 text-gray-800",
};

const statusIcons: Record<$Enums.Estado, string> = {
  PAGADO: "text-green-500",
  PENDIENTE: "text-yellow-500",

  INACTIVO: "text-gray-500",
};

const statusLabels: Record<$Enums.Estado, string> = {
  PAGADO: "Pagado",
  PENDIENTE: "Pendiente",

  INACTIVO: "Inactivo",
};

const columns = [
  columnHelper.accessor((row) => `${row.apellido} ${row.nombre}`, {
    id: "nombreCompleto",
    header: ({ column }) => (
      <button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
      >
        Nombre
        {column.getIsSorted() === "asc" ? (
          <FaSortUp className="text-sm" />
        ) : column.getIsSorted() === "desc" ? (
          <FaSortDown className="text-sm" />
        ) : (
          <FaSort className="text-sm opacity-50" />
        )}
      </button>
    ),
    cell: (info) => (
      <span className="font-medium text-gray-900">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("documento", {
    header: () => (
      <span className=" text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Documento
      </span>
    ),
    cell: (info) => (
      <span className=" text-gray-600 font-mono">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("telefono", {
    header: () => (
      <span className="hidden sm:inline text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Teléfono
      </span>
    ),
    cell: (info) => (
      <span className="hidden sm:table-cell text-gray-600">
        {info.getValue() || "-"}
      </span>
    ),
    meta: {
      className: "hidden md:table-cell", // Oculta toda la columna en móviles
    },
  }),
  columnHelper.accessor("estado", {
    header: ({ column }) => (
      <button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
      >
        Estado
        {column.getIsSorted() === "asc" ? (
          <FaSortUp className="text-sm" />
        ) : column.getIsSorted() === "desc" ? (
          <FaSortDown className="text-sm" />
        ) : (
          <FaSort className="text-sm opacity-50" />
        )}
      </button>
    ),
    cell: (info) => {
      // info.getValue() ya es del tipo correcto (Usuario['estado']) gracias al accessor
      const estado = info.getValue();
      return (
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadgeClasses[estado]}`}
          >
            <IoCardOutline className={`mr-1 ${statusIcons[estado]}`} />
            {statusLabels[estado]}
          </span>
        </div>
      );
    },
    sortingFn: (rowA, rowB, columnId) => {
      // Aserción de tipo para asegurar que el valor es de tipo $Enums.Estado
      const estadoA = statusLabels[rowA.getValue(columnId) as $Enums.Estado];
      const estadoB = statusLabels[rowB.getValue(columnId) as $Enums.Estado];
      return estadoA.localeCompare(estadoB);
    },
  }),
  columnHelper.accessor("id", {
    header: () => (
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Acciones
      </span>
    ),
    cell: (info) => (
      <Link
        href={`/admin/users/${info.getValue()}`}
        className="inline-block mx-auto text-blue-600  underline hover:text-blue-800 transition-colors"
        title="Ver detalles"
      >
        Editar
      </Link>
    ),
  }),
];

export const TablaUsuarios = ({ usuarios }: Props) => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: usuarios,
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
    onSortingChange: setSorting,
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <SearchBar
            value={globalFilter ?? ""}
            onChange={setGlobalFilter}
            placeholder="Buscar usuarios..."
          />
          <PaginationControls table={table} showGoToPage showPageSize />
        </div>
      </div>
      <TableGrid table={table} />
      <div className="p-4 border-t border-gray-200">
        <PaginationControls table={table} showGoToPage showPageSize />
      </div>
    </div>
  );
};
