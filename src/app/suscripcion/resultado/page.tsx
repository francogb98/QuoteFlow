import { MercadoPagoConfig, PreApproval } from "mercadopago";
import prisma from "@/lib/prisma";
import { auth } from "@/*";
import Link from "next/link";

const config = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

import { EstadoPagoMercadoPago } from "@prisma/client";

function mapMercadoPagoStatus(status: string): EstadoPagoMercadoPago {
  switch (status) {
    case "pending":
      return EstadoPagoMercadoPago.PENDING;

    case "authorized":
    case "active":
      return EstadoPagoMercadoPago.AUTHORIZED;

    case "cancelled":
      return EstadoPagoMercadoPago.CANCELLED;

    default:
      return EstadoPagoMercadoPago.REJECTED;
  }
}

export default async function ResultadoSuscripcion() {
  const session = await auth();
  if (!session?.user) return null;

  const empresaId = session.user.empresaId;

  const suscripcion = await prisma.suscripcionEmpresa.findUnique({
    where: { empresaId },
  });

  if (!suscripcion?.mercadoPagoPreApprovalId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow text-center">
          <h1 className="text-xl font-bold mb-4">No se encontró suscripción</h1>

          <Link
            href="/admin"
            className="bg-purple-600 text-white px-5 py-2 rounded-lg"
          >
            Ir al Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const preApprovalClient = new PreApproval(config);

  const mpSubscription = await preApprovalClient.get({
    id: suscripcion.mercadoPagoPreApprovalId,
  });

  console.log("Estado MP:", mpSubscription);

  let estadoTexto = "Pendiente";
  let estadoColor = "text-yellow-600";
  let estadoSuscripcion = suscripcion.estadoSuscripcion;

  if (
    mpSubscription.status === "authorized" ||
    mpSubscription.status === "active"
  ) {
    estadoTexto = "Suscripción activa";
    estadoColor = "text-green-600";
    estadoSuscripcion = "ACTIVA";
  }

  if (mpSubscription.status === "cancelled") {
    estadoTexto = "Suscripción cancelada";
    estadoColor = "text-red-600";
    estadoSuscripcion = "CANCELADA";
  }

  await prisma.suscripcionEmpresa.update({
    where: { empresaId },
    data: {
      estadoSuscripcion: estadoSuscripcion,
      estadoPagoMercadoPago: mapMercadoPagoStatus(mpSubscription.status!),
      fechaInicio: mpSubscription.date_created
        ? new Date(mpSubscription.date_created)
        : undefined,
      fechaFinPeriodoActual: mpSubscription.next_payment_date
        ? new Date(mpSubscription.next_payment_date)
        : undefined,
    },
  });

  if (mpSubscription.status === "cancelled") {
    estadoTexto = "Suscripción cancelada";
    estadoColor = "text-red-600";
  }

  const fechaInicio = suscripcion.fechaInicio
    ? new Date(suscripcion.fechaInicio).toLocaleDateString("es-AR")
    : "—";

  const fechaVencimiento = suscripcion.fechaFinPeriodoActual
    ? new Date(suscripcion.fechaFinPeriodoActual).toLocaleDateString("es-AR")
    : "—";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-xl shadow text-center space-y-6 max-w-md">
        <h1 className="text-2xl font-bold">Resultado del pago</h1>

        <p className={`text-lg font-semibold ${estadoColor}`}>{estadoTexto}</p>

        <div className="border rounded-lg p-4 text-left space-y-2 bg-gray-50">
          <div className="flex justify-between">
            <span className="text-gray-500">Plan contratado</span>
            <span className="font-medium">{suscripcion.planTipo}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Facturación</span>
            <span className="font-medium">{suscripcion.frecuenciaPago}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Inicio de suscripción</span>
            <span className="font-medium">{fechaInicio}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Próximo vencimiento</span>
            <span className="font-medium">{fechaVencimiento}</span>
          </div>
        </div>

        <Link
          href="/admin/home"
          className="inline-block bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-lg"
        >
          Ir al panel de administración
        </Link>
      </div>
    </div>
  );
}
