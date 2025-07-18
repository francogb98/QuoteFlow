// components/PaginationControls.tsx
"use client";
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";

interface PaginationControlsProps {
  table: any;
  showPageSize?: boolean;
  showGoToPage?: boolean;
}

export const PaginationControls = ({
  table,
  showPageSize = true,
  showGoToPage = true,
}: PaginationControlsProps) => (
  <div className="flex items-center gap-3 text-sm w-full md:w-auto">
    {showPageSize && (
      <div className="hidden xl:flex items-center gap-2">
        <span className="text-gray-600 whitespace-nowrap">Mostrar:</span>
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
          className="border border-gray-200 rounded-md px-3 py-1.5 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              {pageSize}
            </option>
          ))}
        </select>
      </div>
    )}

    <div className="flex items-center gap-1">
      <button
        onClick={() => table.firstPage()}
        disabled={!table.getCanPreviousPage()}
        className="p-2 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Primera página"
      >
        <FiChevronsLeft className="text-gray-600" />
      </button>
      <button
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
        className="p-2 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Página anterior"
      >
        <FiChevronLeft className="text-gray-600" />
      </button>

      <div className="flex items-center px-3 py-1 bg-blue-50 text-blue-600 rounded-md">
        <span className="hidden sm:block">Página </span>
        <strong className="mx-1">
          {table.getState().pagination.pageIndex + 1}
        </strong>{" "}
        de <strong className="ml-1">{table.getPageCount()}</strong>
      </div>

      <button
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
        className="p-2 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Siguiente página"
      >
        <FiChevronRight className="text-gray-600" />
      </button>
      <button
        onClick={() => table.lastPage()}
        disabled={!table.getCanNextPage()}
        className="p-2 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Última página"
      >
        <FiChevronsRight className="text-gray-600" />
      </button>
    </div>

    {showGoToPage && (
      <div className="hidden xl:flex items-center gap-2">
        <span className="text-gray-600 whitespace-nowrap">Ir a:</span>
        <input
          type="number"
          min="1"
          max={table.getPageCount()}
          defaultValue={table.getState().pagination.pageIndex + 1}
          onChange={(e) => {
            const page = e.target.value ? Number(e.target.value) - 1 : 0;
            table.setPageIndex(page);
          }}
          className="w-16 border border-gray-200 rounded-md px-2 py-1.5 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
        />
      </div>
    )}
  </div>
);
