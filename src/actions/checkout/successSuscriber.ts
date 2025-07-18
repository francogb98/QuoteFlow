import { PreApproval } from "mercadopago";

import { config } from "@/lib";
import { createCompanyAndAdmin } from "../auth/registration/createCompanyAndAdmin";

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

    if (
      preapproval.status === "authorized" ||
      preapproval.status === "approved"
    ) {
      const tempRegistrationIdFromWebhook = preapproval.external_reference;

      if (tempRegistrationIdFromWebhook) {
        const creationResult = await createCompanyAndAdmin(
          tempRegistrationIdFromWebhook
        );
        if (creationResult.ok) {
          console.log(
            `Empresa y administrador creados por webhook para tempRegistrationId: ${tempRegistrationIdFromWebhook}`
          );
        }
        return { success: true };
      }
    } else if (preapproval.status === "rejected") {
      return { success: false };
    }

    return { success: false };
  } catch (error) {
    console.error("Error al procesar el webhook de Mercado Pago:", error);
    return { success: false };
  }
}
