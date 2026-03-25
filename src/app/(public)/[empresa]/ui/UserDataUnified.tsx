"use client";
import { useEffect, useMemo, useState } from "react";
import type { Usuario, Pago } from "@prisma/client";
import { fonts, fontVariables } from "@/lib/font/fonts";
import {
  Calendar,
  CheckCircle,
  Eye,
  EyeOff,
  AlertTriangle,
  Zap,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { PaymentModal } from "../[documento]/comprobante/PaymentModal";
import { PaymentButton } from "./PaymentButton";
import {
  getMembershipStatus,
  formatDateLocal,
} from "@/lib/membership/membershipUtils";

interface Props {
  usuario: Usuario & { pagos: Pago[] };
  modeloCobro: "MERCADOPAGO" | "COMPROBANTE";
  empresa: string;
  documento: string;
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

export const UserDataUnified = ({
  usuario,
  modeloCobro,
  empresa,
  documento,
}: Props) => {
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPago, setSelectedPago] = useState<Pago | null>(null);
  const router = useRouter();

  // Calcular información de membresía
  const membershipInfo = useMemo(
    () => getMembershipStatus(usuario.fechaInicioMembresia, usuario.pagos),
    [usuario.fechaInicioMembresia, usuario.pagos],
  );

  // Función para abrir el modal (ahora pasada como prop a PaymentButton)
  const handleViewReceipt = (pago: Pago) => {
    setSelectedPago(pago);
    setIsModalOpen(true);
  };

  // Función para manejar el pago (ahora pasada como prop a PaymentButton)
  const handlePay = (pago: Pago) => {
    if (modeloCobro === "MERCADOPAGO") {
      router.push(`${usuario.documento}/${pago.id}`);
    } else {
      setSelectedPago(pago);
      setIsModalOpen(true);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  const pagosPendientes = usuario.pagos.filter(
    (p) =>
      p.estado === "PENDIENTE" ||
      p.estado === "RECHAZADO" ||
      p.estado === "VENCIDO",
  );
  const pagosAMostrar = mostrarTodos ? usuario.pagos : pagosPendientes;
  const totalPendiente = pagosPendientes.reduce((sum, p) => sum + p.monto, 0);

  useEffect(() => {
    return () => {};
  }, [selectedPago, isModalOpen]);

  return (
    <div
      className={`max-w-6xl mx-auto ${fontVariables}`}
      style={{ fontFamily: fonts.body }}
    >
      {/* User info header */}
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-md border border-purple-100 mb-8 p-4 sm:p-6">
        <div className="flex flex-col gap-6">
          {/* Row 1: User info and Pending payments */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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
                  className={`text-xs font-medium ${totalPendiente > 0 ? "text-orange-600" : "text-green-600"}`}
                >
                  {totalPendiente > 0 ? "Total Pendiente" : "Estado de Cuenta"}
                </p>
                <p
                  className={`text-lg font-bold ${totalPendiente > 0 ? "text-orange-700" : "text-green-700"}`}
                >
                  {totalPendiente > 0
                    ? formatCurrency(totalPendiente)
                    : "Todo Pagado"}
                </p>
              </div>
            </div>
          </div>

          {/* Row 2: Membership dates */}
          {membershipInfo.inicio && membershipInfo.vencimiento ? (
            <div className="flex items-start gap-4 p-4 rounded-lg border-2 bg-blue-50 border-blue-200">
              {/* Icon */}
              <div className="shrink-0 w-12 h-12 rounded-lg flex items-center justify-center bg-blue-200">
                <Calendar className="w-6 h-6 text-blue-700" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-bold text-gray-900 mb-3">
                  Membresía
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Inicio:</span>
                    <span className="font-semibold text-gray-900">
                      {formatDateLocal(membershipInfo.inicio)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Proximo vencimiento:</span>
                    <span className="font-semibold text-blue-700">
                      {formatDateLocal(membershipInfo.vencimiento)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Payments section */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
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
              {/* Desktop table */}
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
                          pago.estado === "PENDIENTE" ||
                          pago.estado === "VENCIDO"
                            ? "bg-orange-50/30"
                            : ""
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
                                  : pago.estado === "VENCIDO"
                                    ? "bg-red-100 text-red-800 border border-red-200"
                                    : "bg-red-100 text-red-800 border border-red-200" // Catch-all for "RECHAZADO"
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
                          <PaymentButton
                            pago={pago}
                            modeloCobro={modeloCobro}
                            onPay={handlePay}
                            onViewReceipt={handleViewReceipt}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="lg:hidden space-y-4">
                {pagosAMostrar.map((pago) => (
                  <div
                    key={pago.id}
                    className={`border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 ${
                      pago.estado === "PENDIENTE" || pago.estado === "VENCIDO"
                        ? "bg-gradient-to-r from-orange-50 to-yellow-50/30 border-orange-200"
                        : "bg-gradient-to-r from-white to-purple-50/30 border-purple-100"
                    }`}
                  >
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
                              : pago.estado === "VENCIDO"
                                ? "bg-red-100 text-red-800 border-red-200"
                                : "bg-red-100 text-red-800 border-red-200" // Catch-all for "RECHAZADO"
                        }`}
                      >
                        {pago.estado}
                      </span>
                    </div>
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Monto</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">
                        {formatCurrency(pago.monto)}
                      </p>
                    </div>
                    <div className="flex justify-end w-full">
                      <PaymentButton
                        pago={pago}
                        modeloCobro={modeloCobro}
                        onPay={handlePay}
                        onViewReceipt={handleViewReceipt}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {selectedPago && (
        <PaymentModal
          isOpen={isModalOpen}
          empresa={empresa}
          documento={documento}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPago(null);
          }}
          pago={selectedPago}
          usuarioId={usuario.id}
          administradorId={usuario.administradorId}
        />
      )}
    </div>
  );
};
