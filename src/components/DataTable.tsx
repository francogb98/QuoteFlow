
"use client";

import React from "react";
import { Loader2, AlertCircle } from "lucide-react";

interface DataTableProps<T> {
  data: T[];
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  renderItem: (item: T) => React.ReactNode;
  emptyMessage?: string;
  gridClassName?: string;
  // Pagination Props
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  // Filter/Search Props
  // searchTerm?: string;
  // onSearchChange?: (searchTerm: string) => void;
  // filters?: Array<{ label: string; value: string }>;
  // onFilterChange?: (filter: string) => void;
}

export function DataTable<T>({
  data,
  isPending,
  isError,
  error,
  renderItem,
  emptyMessage = "No se encontraron resultados.",
  gridClassName = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
  currentPage,
  totalPages,
  onPageChange,
}: DataTableProps<T>) {
  if (isPending) {
    return (
      <div className="flex justify-center items-center h-full min-h-[200px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900">Cargando...</h3>
        </div>
      </div>
    );
  }

  if (isError || error) {
    return (
      <div className="text-center text-red-500 p-4">
        <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
        <h3 className="text-lg font-semibold text-gray-900">Error al cargar datos.</h3>
        <p className="text-sm text-gray-600">{error?.message || "Ha ocurrido un error inesperado"}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {data.length > 0 ? (
        <div className={gridClassName}>
          {data.map((item, index) => (
            <React.Fragment key={index}>{renderItem(item)}</React.Fragment>
          ))}
        </div>
      ) : (
        <div className="col-span-full text-center text-gray-500 p-8 border border-dashed rounded-lg">
          {emptyMessage}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages && totalPages > 1 && currentPage && onPageChange && (
        <div className="flex justify-center items-center mt-8 space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${page === currentPage ? "bg-purple-600 text-white shadow-md" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
