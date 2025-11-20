import prisma from "@/lib/prisma";
import { logger } from "../lib/logger";

/**
 * applyGraceDayAdjustments:
 * - Revisa pagos pendientes que pasaron dias de gracia y actualiza monto a recargo si corresponde.
 * - Retorna resumen de cambios.
 */
export async function applyGraceDayAdjustments(today: Date = new Date()) {
  const summary: any = { checked: 0, updated: 0, details: [] };

  // Ejemplo: buscar pagos PENDIENTE cuyo fechaVencimiento + diasGracia < today
  const pendientes = await prisma.pago.findMany({
    where: { estado: "PENDIENTE" },
    include: { usuario: true },
  });

  for (const p of pendientes) {
    summary.checked++;
    try {
      // obtener diasGracia desde dinamica o configuracion del admin
      // calcular si aplica recargo y actualizar monto/estado si corresponde
      // ... implementá tu lógica existente aquí ...
    } catch (err) {
      logger.error("[applyGraceDayAdjustments] error", { pagoId: p.id, err });
    }
  }

  return summary;
}
