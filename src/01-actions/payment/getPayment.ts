"use server";

import { config } from "@/lib/mercadopago/mercadopago.config";
import { Payment } from "mercadopago";

interface PaymentResponse {
  id: number;
  status: string;
  status_detail: string;
  date_approved: string;
  date_created: string;
  description: string;
  transaction_amount: number;
  payment_method: {
    id: string;
  };
  transaction_details: {
    net_received_amount: number;
  };
  fee_details: Array<{
    amount: number;
  }>;
  metadata: {
    nombre: string;
    documento: string;
    mes: string;
    admin_id?: string;
  };
}

export async function getPayment(
  comprobante: string
): Promise<PaymentResponse> {
  try {
    if (!comprobante) {
      throw new Error("comprobante es requerido");
    }

    const payment = await new Payment(config).get({ id: comprobante });

    // Extraer solo los datos necesarios
    const essentialData: PaymentResponse = {
      id: payment.id!,
      status: payment.status!,
      status_detail: payment.status_detail!,
      date_approved: payment.date_approved!,
      date_created: payment.date_created!,
      description: payment.description!,
      transaction_amount: payment.transaction_amount!,
      payment_method: {
        id:
          payment.payment_method_id || payment.payment_method?.id || "unknown",
      },
      transaction_details: {
        net_received_amount:
          payment.transaction_details?.net_received_amount || 0,
      },
      fee_details:
        payment.fee_details?.map((fee) => ({
          amount: fee.amount || 0,
        })) || [],
      metadata: {
        nombre: payment.metadata?.nombre || "",
        documento: payment.metadata?.documento || "",
        mes: payment.metadata?.mes || "",
        admin_id: payment.metadata?.admin_id,
      },
    };

    return essentialData;
  } catch (error) {
    console.error("Error al obtener el pago:", error);
    throw new Error("Error al obtener el pago");
  }
}
