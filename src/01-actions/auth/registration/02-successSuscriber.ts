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

    if (!preapproval) {
      return { success: false };
    }

    if (preapproval.status === "rejected") {
      return { success: false };
    }

    if (
      preapproval.status === "authorized" ||
      preapproval.status === "approved"
    ) {
      const tempRegistrationIdFromWebhook = preapproval.external_reference;

      if (tempRegistrationIdFromWebhook) {
        const creationResult = await createCompanyAndAdmin(
          tempRegistrationIdFromWebhook
        );

        return { success: true };
      }
    }
  } catch (error) {
    console.error("Error al procesar el webhook de Mercado Pago:", error);
    return { success: false };
  }
}
