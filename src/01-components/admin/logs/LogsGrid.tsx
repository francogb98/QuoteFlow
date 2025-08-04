"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { getLogs } from "@/01-actions/admin/logs/getLogs";
import { LogCard } from "./LogCard";
import { CronLogCard } from "./CronLogCard"; // Importa el nuevo componente

const itemsPerPage = 10;

export const LogsGrid = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const logsQuery = useQuery({
    queryKey: ["logs", currentPage],
    queryFn: () => getLogs(currentPage, itemsPerPage),
    retry: 2,
    staleTime: 5 * 60 * 1000,
    enabled: true,
  });

  if (logsQuery.isPending) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-gray-500">Cargando logs...</div>
      </div>
    );
  }

  if (logsQuery.isError || !logsQuery.data?.ok) {
    return (
      <div className="text-center text-red-500 p-4">
        Error al cargar los logs.
      </div>
    );
  }

  const { logs, totalPages } = logsQuery.data;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 
            ${
              i === currentPage
                ? "bg-purple-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }
          `}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {logs.length > 0 ? (
          logs.map((log) => {
            // Lógica condicional para renderizar el componente de card correcto
            if (
              log.action === "CRON_DAILY_EXECUTED" ||
              log.action === "CRON_MONTHLY_EXECUTED"
            ) {
              return <CronLogCard key={log.id} log={log} />;
            }
            return <LogCard key={log.id} log={log} />;
          })
        ) : (
          <div className="col-span-full text-center text-gray-500 p-8">
            No se encontraron logs.
          </div>
        )}
      </div>

      {/* Controles de paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          {renderPaginationButtons()}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};
