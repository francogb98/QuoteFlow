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
} from "react-icons/fa";
import { handlePayment } from "@/actions/checkout/handlePayment";
import type { Pago } from "@prisma/client";
import { useRouter } from "next/navigation"; // Importa useRouter

interface Props {
  nombreUsuarioCompleto: string;
  documento: string;
  adminId: string;
  pagoActual: Pago;
  meses: string[];
  // onClose ya no es necesario como prop
}

export const HandlePayment = ({
  nombreUsuarioCompleto,
  documento,
  adminId,
  pagoActual,
  meses,
}: // onClose, // Eliminamos de las props
Props) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // Inicializa useRouter

  const handlePay = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const response = await handlePayment(formData);
    if (response?.redirectUrl) {
      window.location.href = response.redirectUrl;
    }
    // El setTimeout para setLoading(false) solo se ejecutará si no hay redirección
    // Si hay redirección, la página se recargará y el estado se reseteará
    setTimeout(() => {
      setLoading(false);
    }, 2000);
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
    <div className="h-[calc(100vh-10rem)] sm:min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-100">
      {/* Contenido principal */}
      <div className="p-4 pb-24 lg:pb-4">
        <div className="max-w-5xl mx-auto">
          {/* Botón Volver */}
          <button
            onClick={() => router.back()} // Usamos router.back()
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
                            Serás redirigido a nuestra plataforma de pago segura
                          </p>
                        </div>
                        <form onSubmit={handlePay} className="space-y-4">
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
                          <input type="hidden" name="adminId" value={adminId} />
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
            <form onSubmit={handlePay}>
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
  );
};
