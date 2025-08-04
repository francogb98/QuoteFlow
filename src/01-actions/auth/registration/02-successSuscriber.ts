import { PreApproval } from "mercadopago";
import { config } from "@/lib";
import { createCompanyAndAdmin } from "./03-createCompanyAndAdmin";

interface Data {
  preapproval_created: string;
  empresaId: string;
  planType: string;
  frequency: string;
  preapproval_id: string;
}

export async function successSuscriber(data: Data) {
  try {
    const preapproval = await new PreApproval(config).get({
      id: data.preapproval_id,
    });

    if (!preapproval || preapproval.status === "rejected") {
      return {
        success: false,
        error: "Pre-aprobación rechazada o no encontrada.",
      };
    }

    if (
      preapproval.status === "authorized" ||
      preapproval.status === "approved"
    ) {
      const tempRegistrationIdFromWebhook = preapproval.external_reference;

      if (tempRegistrationIdFromWebhook) {
        // --- CAMBIO CLAVE ---
        // Se llama a la función con los dos argumentos por separado,
        // tal como `createCompanyAndAdmin` los espera.
        const creationResult = await createCompanyAndAdmin(
          tempRegistrationIdFromWebhook,
          data.preapproval_id // Este es el preapprovalId que guardaremos
        );

        if (!creationResult.ok) {
          console.error(creationResult.error);
          return { success: false, error: creationResult.error };
        }

        return { success: true };
      }
    }

    return { success: false, error: "Estado de pago no válido." };
  } catch (error) {
    console.error("Error al procesar el pago de Mercado Pago:", error);
    return { success: false, error: "Error al procesar el pago." };
  }
}
