"use client";

import type React from "react";
import { useState } from "react";
import { IoCardSharp, IoCalendarSharp, IoCashSharp } from "react-icons/io5";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaShieldAlt,
  FaTimes,
  FaInfoCircle,
} from "react-icons/fa";
import { handlePayment } from "@/actions/checkout/handlePayment";
import type { Pago } from "@prisma/client";
import { useRouter } from "next/navigation";

interface Props {
  nombreUsuarioCompleto: string;
  documento: string;
  adminId: string;
  pagoActual: Pago;
  meses: string[];
}

export const HandlePayment = ({
  nombreUsuarioCompleto,
  documento,
  adminId,
  pagoActual,
  meses,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const router = useRouter();

  const handlePayClick = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setPendingFormData(formData);
    setShowConfirmModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!pendingFormData) return;

    setShowConfirmModal(false);
    setLoading(true);

    const response = await handlePayment(pendingFormData);
    if (response?.redirectUrl) {
      window.location.href = response.redirectUrl;
    }

    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const handleCancelPayment = () => {
    setShowConfirmModal(false);
    setPendingFormData(null);
  };

  const getStatusIcon = () => {
    switch (pagoActual.estado) {
      case "PAGADO":
        return (
          <FaCheckCircle className="text-green-600 w-4 h-4 sm:w-5 sm:h-5" />
        );
      case "PENDIENTE":
        return <FaClock className="text-purple-600 w-4 h-4 sm:w-5 sm:h-5" />;
      default:
        return (
          <FaExclamationTriangle className="text-red-600 w-4 h-4 sm:w-5 sm:h-5" />
        );
    }
  };

  const getStatusBadge = () => {
    const baseClasses =
      "inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold";
    switch (pagoActual.estado) {
      case "PAGADO":
        return (
          <span className={`${baseClasses} bg-green-500 text-white`}>
            PAGADO
          </span>
        );
      case "PENDIENTE":
        return (
          <span className={`${baseClasses} bg-purple-500 text-white`}>
            PENDIENTE
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-red-500 text-white`}>
            VENCIDO
          </span>
        );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  return (
    <>
      <div className="h-[calc(100vh-10rem)] sm:min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-100">
        {/* Contenido principal */}
        <div className="p-4 pb-24 lg:pb-4">
          <div className="max-w-5xl mx-auto">
            {/* Botón Volver */}
            <button
              onClick={() => router.back()}
              className="mb-4 inline-flex items-center px-3 py-2 bg-white hover:bg-gray-50 text-purple-700 border border-purple-200 rounded-lg shadow-sm font-medium text-sm"
            >
              <FaArrowLeft className="mr-2 w-3 h-3" />
              Volver
            </button>

            {/* Card Principal */}
            <div className="bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-violet-600 p-4 text-white">
                <div className="flex items-center mb-2">
                  <IoCalendarSharp className="mr-2 w-5 h-5" />
                  <h2 className="text-xl font-bold">Detalles del Pago</h2>
                </div>
                <div className="bg-white/20 rounded-lg p-2">
                  <p className="font-semibold text-white">
                    {nombreUsuarioCompleto}
                  </p>
                  <p className="text-purple-200 text-sm">DNI: {documento}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {loading ? (
                  <div className="p-6 text-center">
                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-200 mx-auto">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-600 mx-auto mb-3"></div>
                      <h3 className="font-bold text-purple-800 mb-1">
                        Procesando Pago
                      </h3>
                      <p className="text-purple-600 text-sm">
                        Redireccionando...
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="lg:grid lg:grid-cols-2 lg:gap-8 space-y-6 lg:space-y-0">
                    {/* Información del pago */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-800 flex items-center">
                        <div className="w-0.5 h-5 bg-gradient-to-b from-purple-500 to-violet-500 rounded-full mr-2"></div>
                        Información del Pago
                      </h3>

                      {/* Estado */}
                      <div className="bg-gray-50 rounded-lg p-3 border border-purple-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon()}
                            <div>
                              <p className="text-xs font-medium text-gray-600">
                                Estado del Pago
                              </p>
                              <p className="text-sm font-bold text-gray-800">
                                {pagoActual.estado}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge()}
                        </div>
                      </div>

                      {/* Período */}
                      <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                        <div className="flex items-center space-x-2">
                          <IoCalendarSharp className="text-purple-600 w-5 h-5" />
                          <div>
                            <p className="text-xs font-medium text-purple-600">
                              Período de Pago
                            </p>
                            <p className="font-bold text-purple-800">
                              {meses[pagoActual.mes - 1]} {pagoActual.año}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Monto */}
                      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <div className="flex items-center space-x-2">
                          <IoCashSharp className="text-green-600 w-5 h-5" />
                          <div>
                            <p className="text-xs font-medium text-green-600">
                              Monto a Pagar
                            </p>
                            <p className="text-xl font-bold text-green-700">
                              {formatCurrency(pagoActual.monto)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Alerta de vencimiento */}
                      {pagoActual.estaVencido && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <FaExclamationTriangle className="text-red-600 w-5 h-5" />
                            <div>
                              <p className="font-bold text-red-800 text-sm">
                                Pago Vencido
                              </p>
                              <p className="text-red-600 text-xs">
                                Este pago se encuentra fuera de término
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Formulario de pago - Solo visible en desktop */}
                    <div className="hidden lg:block space-y-4">
                      <h3 className="text-lg font-bold text-gray-800 flex items-center">
                        <div className="w-0.5 h-5 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full mr-2"></div>
                        Procesar Pago
                      </h3>
                      <div className="bg-white border-2 border-dashed border-purple-300 rounded-xl overflow-hidden">
                        <div className="p-4">
                          <div className="text-center mb-4">
                            <div className="bg-gradient-to-r from-purple-500 to-violet-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                              <IoCardSharp className="w-6 h-6 text-white" />
                            </div>
                            <h4 className="font-bold text-gray-800 mb-1">
                              Pago Seguro
                            </h4>
                            <p className="text-gray-600 text-sm">
                              Serás redirigido a nuestra plataforma de pago
                              segura
                            </p>
                          </div>
                          <form onSubmit={handlePayClick} className="space-y-4">
                            <input
                              type="hidden"
                              name="suscriberMount"
                              value={pagoActual.monto}
                            />
                            <input
                              type="hidden"
                              name="nombre"
                              value={nombreUsuarioCompleto}
                            />
                            <input
                              type="hidden"
                              name="mes"
                              value={meses[pagoActual.mes - 1]}
                            />
                            <input
                              type="hidden"
                              name="documento"
                              value={documento}
                            />
                            <input
                              type="hidden"
                              name="adminId"
                              value={adminId}
                            />
                            <button
                              type="submit"
                              disabled={loading}
                              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg text-sm flex items-center justify-center"
                            >
                              <IoCardSharp className="mr-2 w-4 h-4" />
                              Pagar Ahora - {formatCurrency(pagoActual.monto)}
                            </button>
                          </form>

                          {/* Aviso de expiración */}
                          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center text-yellow-800">
                              <FaClock className="mr-2 w-3 h-3" />
                              <div>
                                <p className="font-semibold text-xs">
                                  Tiempo límite de sesión
                                </p>
                                <p className="text-xs">
                                  El pago expirará en 10 minutos por seguridad
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer fijo para mobile - Solo visible en mobile */}
        {!loading && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl">
            {/* Información del pago en el footer */}
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FaShieldAlt className="text-green-600 w-4 h-4" />
                  <span className="text-xs text-gray-600 font-medium">
                    Pago 100% seguro
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <FaClock className="text-yellow-600 w-3 h-3" />
                  <span className="text-xs text-yellow-700 font-medium">
                    10 min
                  </span>
                </div>
              </div>
            </div>

            {/* Botón de pago principal */}
            <div className="p-4">
              <form onSubmit={handlePayClick}>
                <input
                  type="hidden"
                  name="suscriberMount"
                  value={pagoActual.monto}
                />
                <input
                  type="hidden"
                  name="nombre"
                  value={nombreUsuarioCompleto}
                />
                <input
                  type="hidden"
                  name="mes"
                  value={meses[pagoActual.mes - 1]}
                />
                <input type="hidden" name="documento" value={documento} />
                <input type="hidden" name="adminId" value={adminId} />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 hover:from-green-600 hover:via-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center text-lg transform active:scale-95"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <IoCardSharp className="mr-3 w-6 h-6" />
                      <span>Pagar Ahora</span>
                    </div>
                    <div className="bg-white/20 px-3 py-1 rounded-lg">
                      <span className="font-bold">
                        {formatCurrency(pagoActual.monto)}
                      </span>
                    </div>
                  </div>
                </button>
              </form>

              {/* Texto de seguridad */}
              <p className="text-center text-xs text-gray-500 mt-2">
                Procesado por plataforma segura • Datos protegidos
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Confirmación */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto animate-in fade-in duration-300">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />

          {/* Modal Container */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all animate-in zoom-in-95 duration-300">
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 border-b border-amber-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mr-4">
                      <FaInfoCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Importante
                      </h3>
                      <p className="text-sm text-gray-600">
                        Antes de proceder con el pago
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCancelPayment}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Información del pago */}
                <div className="bg-purple-50 rounded-lg p-4 mb-6 border border-purple-200">
                  <div className="text-center">
                    <p className="text-sm text-purple-600 mb-1">Vas a pagar</p>
                    <p className="text-2xl font-bold text-purple-800">
                      {formatCurrency(pagoActual.monto)}
                    </p>
                    <p className="text-sm text-purple-600">
                      {meses[pagoActual.mes - 1]} {pagoActual.año}
                    </p>
                  </div>
                </div>

                {/* Instrucciones importantes */}
                <div className="space-y-4 mb-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <FaExclamationTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-red-800 text-sm mb-2">
                          ⚠️ MUY IMPORTANTE
                        </h4>
                        <ul className="text-sm text-red-700 space-y-1">
                          <li>
                            • <strong>NO cierres</strong> esta ventana durante
                            el proceso
                          </li>
                          <li>
                            • <strong>NO presiones</strong> el botón "Atrás" del
                            navegador
                          </li>
                          <li>
                            • <strong>Espera</strong> a ser redirigido
                            automáticamente
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <FaShieldAlt className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-blue-800 text-sm mb-2">
                          🔒 Proceso Seguro
                        </h4>
                        <p className="text-sm text-blue-700">
                          Serás redirigido a nuestra plataforma de pago segura.
                          El proceso puede tomar unos segundos.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCancelPayment}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-medium rounded-lg transition-all duration-300"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmPayment}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300"
                  >
                    <IoCardSharp className="w-4 h-4" />
                    Entendido, Pagar
                  </button>
                </div>

                {/* Nota adicional */}
                <p className="text-center text-xs text-gray-500 mt-4">
                  Al continuar, aceptas seguir estas instrucciones para
                  completar el pago exitosamente.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
