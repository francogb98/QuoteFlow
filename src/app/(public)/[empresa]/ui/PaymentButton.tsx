// src/app/payment/components/PaymentButton.tsx
"use client";
import { CreditCard, Eye, Upload, Receipt } from "lucide-react";
import { Pago } from "@prisma/client";
import { useRouter } from "next/navigation";

interface PaymentButtonProps {
  pago: Pago;
  modeloCobro: "MERCADOPAGO" | "COMPROBANTE";
  isMobile?: boolean;
  onViewReceipt: (pago: Pago) => void;
  onPay: (pago: Pago) => void;
}

const esUrl = (comprobante: string): boolean => {
  return comprobante.startsWith("https");
};

export const PaymentButton = ({
  pago,
  modeloCobro,
  isMobile = false,
  onViewReceipt,
  onPay,
}: PaymentButtonProps) => {
  const router = useRouter(); // Moved to the top level

  console.log(pago);

  // Lógica para pagos PENDIENTES o RECHAZADOS
  if (
    pago.estado === "PENDIENTE" ||
    pago.estado === "RECHAZADO" ||
    pago.estado === "VENCIDO"
  ) {
    if (modeloCobro === "MERCADOPAGO") {
      return (
        <button
          onClick={() => onPay(pago)}
          className="inline-flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 w-full sm:w-auto"
        >
          <CreditCard
            className={`${isMobile ? "mr-1 w-3 h-3" : "mr-2 w-4 h-4"}`}
          />
          <span className={isMobile ? "sm:hidden" : "hidden sm:inline"}>
            Pagar Ahora
          </span>
          <span className={isMobile ? "hidden sm:inline" : "sm:hidden"}>
            Pagar
          </span>
        </button>
      );
    } else {
      return (
        <button
          onClick={() => onPay(pago)}
          className="inline-flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 w-full sm:w-auto"
        >
          {pago.comprobante ? (
            <>
              <Eye
                className={`${isMobile ? "mr-1 w-3 h-3" : "mr-2 w-4 h-4"}`}
              />
              <span className={isMobile ? "sm:hidden" : "hidden sm:inline"}>
                Ver Comprobante
              </span>
              <span className={isMobile ? "hidden sm:inline" : "sm:hidden"}>
                Ver
              </span>
            </>
          ) : (
            <>
              <Upload
                className={`${isMobile ? "mr-1 w-3 h-3" : "mr-2 w-4 h-4"}`}
              />
              <span className={isMobile ? "sm:hidden" : "hidden sm:inline"}>
                Cargar Comprobante
              </span>
              <span className={isMobile ? "hidden sm:inline" : "sm:hidden"}>
                Cargar
              </span>
            </>
          )}
        </button>
      );
    }
  }

  // Lógica para pagos PAGADOS (con o sin comprobante)
  else if (pago.estado === "PAGADO") {
    if (pago.comprobante) {
      if (esUrl(pago.comprobante)) {
        return (
          <button
            onClick={() => onViewReceipt(pago)}
            className="inline-flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 bg-green-100 hover:bg-green-200 text-green-700 text-sm font-medium rounded-lg transition-colors w-full sm:w-auto"
          >
            <Receipt
              className={`${isMobile ? "mr-1 w-3 h-3" : "mr-2 w-4 h-4"}`}
            />
            <span className={isMobile ? "sm:hidden" : "hidden sm:inline"}>
              Ver Comprobante
            </span>
            <span className={isMobile ? "hidden sm:inline" : "sm:hidden"}>
              Ver
            </span>
          </button>
        );
      } else {
        return (
          <button
            onClick={() => router.push(`/payment/${pago.comprobante}`)}
            className="inline-flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 bg-green-100 hover:bg-green-200 text-green-700 text-sm font-medium rounded-lg transition-colors w-full sm:w-auto"
          >
            <Receipt
              className={`${isMobile ? "mr-1 w-3 h-3" : "mr-2 w-4 h-4"}`}
            />
            <span className={isMobile ? "sm:hidden" : "hidden sm:inline"}>
              Ver Comprobante
            </span>
            <span className={isMobile ? "hidden sm:inline" : "sm:hidden"}>
              Ver
            </span>
          </button>
        );
      }
    } else {
      return <span className="text-sm text-gray-500">Sin comprobante</span>;
    }
  }

  // Fallback si el estado del pago no es reconocido
  return <span className="text-sm text-gray-500">Estado no reconocido</span>;
};
