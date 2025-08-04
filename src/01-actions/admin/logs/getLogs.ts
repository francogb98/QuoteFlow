"use server";

import { auth } from "@/auth.config";
import prisma from "@/lib/prisma";
import { AuditLog } from "@prisma/client";

interface GetLogsResult {
  logs: AuditLog[];
  totalPages: number;
  ok: boolean;
}

export const getLogs = async (
  page: number = 1,
  limit: number = 10
): Promise<GetLogsResult> => {
  try {
    const session = await auth();
    if (!session?.user) {
      return { logs: [], totalPages: 0, ok: false };
    }

    // Aseguramos que la página y el límite sean números positivos
    const currentPage = Math.max(1, page);
    const itemsPerPage = Math.max(1, limit);

    const totalLogs = await prisma.auditLog.count();
    const totalPages = Math.ceil(totalLogs / itemsPerPage);

    const logs = await prisma.auditLog.findMany({
      skip: (currentPage - 1) * itemsPerPage,
      take: itemsPerPage,
      // Ordenamos por fecha de creación de forma descendente (del más nuevo al más antiguo)
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!logs) {
      return { logs: [], totalPages: 0, ok: true };
    }

    return {
      logs,
      totalPages,
      ok: true,
    };
  } catch (error) {
    console.error("Error al buscar logs:", error);
    return { logs: [], totalPages: 0, ok: false };
  }
};
