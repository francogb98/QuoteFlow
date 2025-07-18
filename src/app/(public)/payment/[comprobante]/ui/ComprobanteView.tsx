"use client";

import { CheckCircle, CreditCard, User, Building, Receipt } from "lucide-react";
import { useState } from "react";
import { IoArrowBack } from "react-icons/io5";

interface Props {
  paymentData: any;
}

export function ComprobanteView({ paymentData }: Props) {
  const [isPrinting, setIsPrinting] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusInfo = (status: string, statusDetail: string) => {
    if (status === "approved" && statusDetail === "accredited") {
      return {
        text: "Pago Aprobado",
        subtext: "Acreditado exitosamente",
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        icon: CheckCircle,
      };
    }
    return {
      text: "Estado del Pago",
      subtext: statusDetail,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      icon: Receipt,
    };
  };

  const statusInfo = getStatusInfo(
    paymentData.status,
    paymentData.status_detail
  );
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-100 py-8">
      {/* BOTON DE VOLVER */}
      <div className="flex items-center justify-center mb-4">
        <button
          className="flex items-center bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => window.history.back()}
        >
          <IoArrowBack className="w-4 h-4 mr-2" />
          Volver
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {/* Comprobante */}
        <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden print:shadow-none print:border-gray-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-violet-600 p-6 text-white print:bg-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Receipt className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Comprobante de Pago</h1>
                  <p className="text-purple-100">
                    PayConsult - Gestión de Pagos
                  </p>
                </div>
              </div>
              <div className="hidden sm:inline-block text-right">
                <p className="text-sm text-purple-100">Comprobante N°</p>
                <p className="text-xl font-bold">{paymentData.id}</p>
              </div>
            </div>
          </div>

          {/* Estado del pago */}
          <div className="p-6 border-b border-gray-100">
            <div
              className={`flex items-center justify-center p-4 rounded-xl ${statusInfo.bgColor} ${statusInfo.borderColor} border`}
            >
              <StatusIcon className={`w-6 h-6 mr-3 ${statusInfo.color}`} />
              <div className="text-center">
                <p className={`text-lg font-bold ${statusInfo.color}`}>
                  {statusInfo.text}
                </p>
                <p className="text-sm text-gray-600">{statusInfo.subtext}</p>
              </div>
            </div>
          </div>

          {/* Información principal */}
          <div className="p-6 space-y-6">
            {/* Detalles del pago */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información del cliente */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2 text-purple-600" />
                  Información del Cliente
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nombre:</span>
                    <span className="font-medium capitalize">
                      {paymentData.metadata.nombre}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Documento:</span>
                    <span className="font-medium">
                      {paymentData.metadata.documento}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Período:</span>
                    <span className="font-medium capitalize">
                      {paymentData.metadata.mes}
                    </span>
                  </div>
                </div>
              </div>

              {/* Información del pago */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-purple-600" />
                  Detalles del Pago
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha de pago:</span>
                    <span className="font-medium">
                      {formatDate(paymentData.date_approved)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID de transacción:</span>
                    <span className="font-medium font-mono">
                      {paymentData.id}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Building className="w-5 h-5 mr-2 text-purple-600" />
                Descripción
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-800">{paymentData.description}</p>
              </div>
            </div>

            {/* Resumen de montos */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Resumen de Montos
              </h3>
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-6 border border-purple-100">
                <div className="text-center">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-semibold text-gray-900">
                      Monto pagado:
                    </span>
                    <span className="text-3xl font-bold text-green-600">
                      {formatCurrency(paymentData.transaction_amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-6 border-t border-gray-100">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Este comprobante certifica el pago realizado a través de
                MercadoPago
              </p>
              <p className="text-xs text-gray-500">
                PayConsult - Sistema de Gestión de Pagos | Generado el{" "}
                {formatDate(new Date().toISOString())}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
