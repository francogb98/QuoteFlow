"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { getLogs } from "@/actions/admin/logs/getLogs";
import { LogCard } from "./LogCard";
import { CronLogCard } from "./CronLogCard";
import { DataTable } from "@/components/DataTable"; // Import DataTable

interface Log {
  id: string;
  action: string;
  details: string;
  createdAt: Date;
  // Add any other properties of a Log item
}

const itemsPerPage = 10;

export const LogsGrid = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const logsQuery = useQuery({
    queryKey: ["logs", currentPage],
    queryFn: async () => {
      const result = await getLogs(currentPage, itemsPerPage);
      if (!result.ok) {
        //@ts-ignore
        throw new Error(result.error || "Error al cargar logs");
      }
      //@ts-ignore
      return result.data;
    },
    retry: 2,
    staleTime: 5 * 60 * 1000,
    enabled: true,
  });

  const { data: logs, totalPages } = logsQuery.data || {
    logs: [],
    totalPages: 0,
  }; // Destructure and provide default values

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <DataTable
      data={logs}
      isPending={logsQuery.isPending}
      isError={logsQuery.isError || !logsQuery.data?.ok}
      error={
        logsQuery.error ||
        (logsQuery.data && !logsQuery.data.ok
          ? new Error(logsQuery.data.error || "Error al cargar logs")
          : null)
      }
      emptyMessage="No se encontraron logs."
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      renderItem={(log: Log) => {
        if (
          log.action === "CRON_DAILY_EXECUTED" ||
          log.action === "CRON_MONTHLY_EXECUTED"
        ) {
          //@ts-ignore
          return <CronLogCard key={log.id} log={log} />;
        }
        //@ts-ignore
        return <LogCard key={log.id} log={log} />;
      }}
    />
  );
};
