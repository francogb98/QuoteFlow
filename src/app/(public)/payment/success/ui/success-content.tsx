"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  IoArrowBack,
  IoCheckmarkCircle,
  IoReloadCircle,
} from "react-icons/io5";

export function SuccessContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    // Obtener parámetros de la URL
    const paymentId = searchParams.get("payment_id");
    const status = searchParams.get("status");
    const preferenceId = searchParams.get("preference_id");
    const merchantOrderId = searchParams.get("merchant_order_id");

    const data = {
      paymentId,
      status,
      preferenceId,
      merchantOrderId,
      date: new Date().toLocaleDateString("es-AR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      time: new Date().toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    console.log(data);
    setPaymentData(data);
    setIsLoading(false);

    // Registrar el pago en tu backend
    if (status === "approved" && paymentId) {
      fetch("/api/mercadopago", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentId,
          status,
          preferenceId,
          merchantOrderId,
        }),
      }).catch((error) => {
        console.error("Error al registrar pago:", error);
      });
    }
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <IoReloadCircle className="mx-auto h-12 w-12 animate-spin text-blue-500" />
          <p className="mt-4 text-lg font-medium text-gray-700">
            Verificando tu pago...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <IoCheckmarkCircle className="h-6 w-6 text-green-600" />
            </div>
            <h1 className="mt-3 text-2xl font-bold text-gray-900">
              ¡Pago exitoso!
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Gracias por tu compra. Hemos recibido tu pago correctamente.
            </p>
          </div>
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Detalles de la transacción
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">N° de transacción:</span>
                <span className="font-medium">
                  {paymentData?.paymentId || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Estado:</span>
                <span className="font-medium text-green-600">
                  {paymentData?.status === "approved"
                    ? "Aprobado"
                    : "Pendiente"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Fecha:</span>
                <span className="font-medium">{paymentData?.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Hora:</span>
                <span className="font-medium">{paymentData?.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">N° de orden:</span>
                <span className="font-medium">
                  {paymentData?.merchantOrderId || "N/A"}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              ¿Qué deseas hacer ahora?
            </h2>
            <div className="space-y-3">
              <Link
                href="/mis-compras"
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span>Ver mis Pagos</span>
                <IoArrowBack className="h-4 w-4" />
              </Link>
              <Link
                href="/"
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span>Volver al inicio</span>
                <IoArrowBack className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              ¿Tienes alguna duda?{" "}
              <a
                href="mailto:soporte@tudominio.com"
                className="text-blue-600 hover:text-blue-500"
              >
                Contáctanos
              </a>
            </p>
            <p className="mt-1">
              Te enviaremos un correo con los detalles de tu compra.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
