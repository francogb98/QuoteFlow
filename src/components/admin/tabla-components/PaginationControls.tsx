"use client";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
        <span className="text-muted-foreground whitespace-nowrap">Mostrar:</span>
        <Select
          value={String(table.getState().pagination.pageSize)}
          onValueChange={(value) => table.setPageSize(Number(value))}
        >
          <SelectTrigger className="w-20 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <SelectItem key={pageSize} value={String(pageSize)}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )}

    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => table.firstPage()}
        disabled={!table.getCanPreviousPage()}
        aria-label="Primera página"
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center px-3 py-1 bg-primary/10 text-primary rounded-md">
        <span className="hidden sm:block">Página </span>
        <strong className="mx-1">
          {table.getState().pagination.pageIndex + 1}
        </strong>{" "}
        de <strong className="ml-1">{table.getPageCount()}</strong>
      </div>

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
        aria-label="Siguiente página"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => table.lastPage()}
        disabled={!table.getCanNextPage()}
        aria-label="Última página"
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>

    {showGoToPage && (
      <div className="hidden xl:flex items-center gap-2">
        <span className="text-muted-foreground whitespace-nowrap">Ir a:</span>
        <input
          type="number"
          min="1"
          max={table.getPageCount()}
          defaultValue={table.getState().pagination.pageIndex + 1}
          onChange={(e) => {
            const page = e.target.value ? Number(e.target.value) - 1 : 0;
            table.setPageIndex(page);
          }}
          className="w-16 border border-input rounded-md px-2 py-1.5 focus-visible:ring-ring focus-visible:ring-[3px] outline-none transition-all duration-200 bg-transparent text-sm"
        />
      </div>
    )}
  </div>
);
