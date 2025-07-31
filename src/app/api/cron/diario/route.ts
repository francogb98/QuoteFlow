import { processDailyComplete } from "@/lib/cron/01-payments/daily";
import { NextResponse } from "next/server";
import { registerCronLog } from "../audit-log-cron";

export async function GET(request: Request) {
  // Validar token de autorización (vía header o query)
  const url = new URL(request.url);
  const token =
    request.headers.get("authorization")?.split(" ")[1] ||
    url.searchParams.get("token");

  if (token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Ejecutar lógica del cron diario
  try {
    // Ejecutar lógica principal
    const result = await processDailyComplete();

    // Registrar en AuditLog
    await registerCronLog("CRON_DAILY_EXECUTED", {
      metadata: {
        ejecutadoEl: new Date().toISOString(),
        tiempoEjecucionMs: result.tiempoEjecucion,
      },
      resultados: {
        pagosVencidos: result.pagosVencidos,
        recargosAplicados: result.recargosAplicados,
        tarifasActualizadas: result.tarifasActualizadas,
        pagosFuturosGenerados: result.pagosFuturosGenerados,
      },
      tipoProceso: result.tipo,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error en cron diario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Bloquear otros métodos HTTP
export async function POST() {
  return NextResponse.json({ message: "Método no permitido" }, { status: 405 });
}
