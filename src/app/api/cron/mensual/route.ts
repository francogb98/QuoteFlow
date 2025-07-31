import { processMonthlyPaymentGeneration } from "@/lib/cron/01-payments/monthly/processMonthlyPayment";
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

  // Ejecutar lógica del cron
  try {
    const result = await processMonthlyPaymentGeneration();
    await registerCronLog("CRON_MONTHLY_EXECUTED", {
      metadata: {
        ejecutadoEl: new Date().toISOString(),
        tiempoEjecucionMs: result.tiempoEjecucion,
      },
      resultados: {
        pagosGenerados: result.pagosGenerados,
        usuariosProcesados: result.usuariosProcesados,
        periodo: `${new Date().getMonth() + 1}/${new Date().getFullYear()}`, // Ej: "7/2024"
      },
      tipoProceso: result.tipo,
    });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error en cron mensual:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Opcional: Bloquear otros métodos HTTP
export async function POST() {
  return NextResponse.json({ message: "Método no permitido" }, { status: 405 });
}
