"use client";
import { useState } from "react";
import type { Usuario, Pago } from "@prisma/client";
import { fonts, fontVariables } from "@/lib/font/fonts";
// HandlePayment ya no se importa aquí, se renderiza en la nueva página dinámica
import {
  Calendar,
  CreditCard,
  CheckCircle,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Importa useRouter

interface Props {
  usuario: Usuario & { pagos: Pago[] };
}

const meses = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export const UserData = ({ usuario }: Props) => {
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const router = useRouter();

  const handlePay = async (pago: Pago) => {
    router.push(`${usuario.documento}/${pago.id}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  const pagosPendientes = usuario.pagos.filter((p) => p.estado === "PENDIENTE");
  const pagosAMostrar = mostrarTodos ? usuario.pagos : pagosPendientes;

  const totalPendiente = pagosPendientes.reduce((sum, p) => sum + p.monto, 0);

  return (
    <div
      className={`max-w-6xl mx-auto ${fontVariables}`}
      style={{ fontFamily: fonts.body }}
    >
      {/* Eliminamos la condición !pagoSeleccionado */}
      <>
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-md border border-purple-100 mb-8 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 capitalize mb-1">
              {`${usuario.apellido} ${usuario.nombre}`}
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              DNI:{" "}
              <span className="font-bold text-gray-800">
                {usuario.documento}
              </span>
            </p>
          </div>
          {/* Total pendiente */}
          <div
            className={`flex items-center gap-3 p-3 rounded-lg border ${
              totalPendiente > 0
                ? "bg-orange-50 border-orange-200"
                : "bg-green-50 border-green-200"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                totalPendiente > 0 ? "bg-orange-500" : "bg-green-500"
              }`}
            >
              {totalPendiente > 0 ? (
                <AlertTriangle className="w-4 h-4 text-white" />
              ) : (
                <CheckCircle className="w-4 h-4 text-white" />
              )}
            </div>
            <div>
              <p
                className={`text-xs font-medium ${
                  totalPendiente > 0 ? "text-orange-600" : "text-green-600"
                }`}
              >
                {totalPendiente > 0 ? "Total Pendiente" : "Estado de Cuenta"}
              </p>
              <p
                className={`text-lg font-bold ${
                  totalPendiente > 0 ? "text-orange-700" : "text-green-700"
                }`}
              >
                {totalPendiente > 0
                  ? formatCurrency(totalPendiente)
                  : "Todo Pagado"}
              </p>
            </div>
          </div>
        </div>
        {/* Sección de pagos */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
          {/* Header con toggle */}
          <div className="bg-gradient-to-r from-purple-600 to-violet-600 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  {mostrarTodos
                    ? "Historial Completo"
                    : pagosPendientes.length > 0
                    ? "Pagos Pendientes"
                    : "Estado de Cuenta"}
                </h3>
                <p className="text-purple-100 mt-1 text-sm sm:text-base">
                  {mostrarTodos
                    ? "Todos los pagos realizados y pendientes"
                    : pagosPendientes.length > 0
                    ? "Pagos que requieren tu atención"
                    : ""}
                </p>
              </div>
              {/* Botón para alternar vista */}
              {usuario.pagos.length > 0 && (
                <button
                  onClick={() => setMostrarTodos(!mostrarTodos)}
                  className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 text-sm font-medium"
                >
                  {mostrarTodos ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      Solo Pendientes
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Historial
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          <div className="p-3 sm:p-6">
            {!usuario.pagos.length ? (
              // Sin pagos registrados
              <div className="text-center py-8 sm:py-12">
                <div className="text-gray-400 mb-4">
                  <Calendar className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
                </div>
                <p className="text-lg sm:text-xl text-gray-500 font-medium">
                  No hay pagos registrados
                </p>
                <p className="text-gray-400 mt-2 text-sm sm:text-base">
                  Los pagos aparecerán aquí cuando estén disponibles
                </p>
              </div>
            ) : !mostrarTodos && pagosPendientes.length === 0 ? (
              // Todo pagado
              <div className="text-center py-8 sm:py-12">
                <div className="text-green-500 mb-4">
                  <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 mx-auto" />
                </div>
                <p className="text-xl sm:text-2xl text-green-600 font-bold mb-2">
                  ¡Todo al día!
                </p>
                <p className="text-gray-600 mb-4">
                  No tienes pagos pendientes en este momento
                </p>
                <button
                  onClick={() => setMostrarTodos(true)}
                  className="inline-flex items-center px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors text-sm font-medium"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver historial de pagos
                </button>
              </div>
            ) : (
              <>
                {/* Vista Desktop - Tabla */}
                <div className="hidden lg:block">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-purple-100">
                        <th className="px-4 py-4 text-left text-sm font-semibold text-purple-900 uppercase tracking-wider">
                          Período
                        </th>
                        <th className="px-4 py-4 text-left text-sm font-semibold text-purple-900 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-4 py-4 text-left text-sm font-semibold text-purple-900 uppercase tracking-wider">
                          Monto
                        </th>
                        <th className="px-4 py-4 text-left text-sm font-semibold text-purple-900 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-50">
                      {pagosAMostrar.map((pago) => (
                        <tr
                          key={pago.id}
                          className={`hover:bg-purple-50/50 transition-colors ${
                            pago.estado === "PENDIENTE" ? "bg-orange-50/30" : ""
                          }`}
                        >
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Calendar className="text-purple-400 mr-3 w-4 h-4" />
                              <span className="text-sm font-medium text-gray-900">
                                {meses[pago.mes - 1]} {pago.año}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                pago.estado === "PAGADO"
                                  ? "bg-green-100 text-green-800 border border-green-200"
                                  : pago.estado === "PENDIENTE"
                                  ? "bg-orange-100 text-orange-800 border border-orange-200"
                                  : "bg-red-100 text-red-800 border border-red-200"
                              }`}
                            >
                              {pago.estado}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-lg font-bold text-gray-900">
                              {formatCurrency(pago.monto)}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {pago.estado === "PENDIENTE" ? (
                              <button
                                onClick={() => handlePay(pago)}
                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                                // Eliminamos la dependencia de loadingPayment y pagoSeleccionado?.id
                                // disabled={loadingPayment && pagoSeleccionado?.id === pago.id}
                              >
                                {/* Eliminamos la lógica de loadingPayment aquí, se manejará en HandlePayment */}
                                <>
                                  <CreditCard className="mr-2 w-4 h-4" />
                                  Pagar Ahora
                                </>
                              </button>
                            ) : pago.comprobante ? (
                              <Link
                                href={`/payment/${pago.comprobante}`}
                                className="inline-flex items-center px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 text-sm font-medium rounded-lg transition-colors"
                              >
                                Ver Comprobante
                              </Link>
                            ) : (
                              <span className="text-sm text-gray-500">
                                Sin comprobante
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Vista Mobile/Tablet - Cards */}
                <div className="lg:hidden space-y-4">
                  {pagosAMostrar.map((pago) => (
                    <div
                      key={pago.id}
                      className={`border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 ${
                        pago.estado === "PENDIENTE"
                          ? "bg-gradient-to-r from-orange-50 to-yellow-50/30 border-orange-200"
                          : "bg-gradient-to-r from-white to-purple-50/30 border-purple-100"
                      }`}
                    >
                      {/* Header del card */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <Calendar className="text-purple-500 mr-2 w-4 h-4" />
                          <span className="font-semibold text-gray-900 text-sm sm:text-base">
                            {meses[pago.mes - 1]} {pago.año}
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${
                            pago.estado === "PAGADO"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : pago.estado === "PENDIENTE"
                              ? "bg-orange-100 text-orange-800 border-orange-200"
                              : "bg-red-100 text-red-800 border-red-200"
                          }`}
                        >
                          {pago.estado}
                        </span>
                      </div>
                      {/* Monto */}
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-1">Monto</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900">
                          {formatCurrency(pago.monto)}
                        </p>
                      </div>
                      {/* Acciones */}
                      <div className="flex justify-end w-full">
                        {pago.estado === "PENDIENTE" ? (
                          <button
                            onClick={() => handlePay(pago)}
                            className="w-full text-center inline-flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                            // Eliminamos la dependencia de loadingPayment y pagoSeleccionado?.id
                            // disabled={loadingPayment && pagoSeleccionado?.id === pago.id}
                          >
                            {/* Eliminamos la lógica de loadingPayment aquí, se manejará en HandlePayment */}
                            <>
                              <CreditCard className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline">
                                Pagar Ahora
                              </span>
                              <span className="sm:hidden">Pagar</span>
                            </>
                          </button>
                        ) : pago.comprobante ? (
                          <Link
                            href={`/payment/${pago.comprobante}`}
                            className="w-full inline-flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 bg-green-100 hover:bg-green-200 text-green-700 font-medium rounded-lg transition-colors"
                          >
                            <span>Ver Comprobante</span>
                          </Link>
                        ) : (
                          <span className="text-gray-500 text-sm">
                            Sin comprobante
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </>
    </div>
  );
};
