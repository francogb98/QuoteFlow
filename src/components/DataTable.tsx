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
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
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
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Cargando...</h3>
        </div>
      </div>
    );
  }

  if (isError || error) {
    return (
      <div className="text-center text-destructive p-4">
        <AlertCircle className="w-8 h-8 mx-auto mb-4 text-destructive" />
        <h3 className="text-lg font-semibold text-foreground">Error al cargar datos.</h3>
        <p className="text-sm text-muted-foreground">{error?.message || "Ha ocurrido un error inesperado"}</p>
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
        <div className="col-span-full text-center p-8 border border-dashed rounded-lg">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {emptyMessage || "No se encontraron resultados"}
          </h3>
          <p className="text-sm text-gray-500">
            No hay datos para mostrar en este momento.
          </p>
        </div>
      )}

      {totalPages && totalPages > 1 && currentPage && onPageChange && (
        <div className="flex justify-center items-center mt-8 space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                page === currentPage
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
