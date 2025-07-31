import prisma from "@/lib/prisma";

type LogAction = "CRON_DAILY_EXECUTED" | "CRON_MONTHLY_EXECUTED";

export async function registerCronLog(
  action: LogAction,
  details: Record<string, unknown>,
  administradorId?: string
) {
  return prisma.auditLog.create({
    data: {
      action,
      entityType: "CRON",
      entityId: "system", // O un ID específico si lo tienes
      details: JSON.stringify(details),
      ipAddress: "cron-job", // O la IP de Vercel si la obtienes
      userAgent: "vercel-cron",
      administradorId,
    },
  });
}
