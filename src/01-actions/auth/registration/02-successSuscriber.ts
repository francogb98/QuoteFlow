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
    console.log(
      `[SUCCESS SUSCRIBER] Procesando preapproval - ID: ${data.preapproval_id}, Empresa: ${data.empresaId}, Plan: ${data.planType}, Frecuencia: ${data.frequency}`,
    );

    const preapproval = await new PreApproval(config).get({
      id: data.preapproval_id,
    });

    console.log(
      `[SUCCESS SUSCRIBER] Preapproval obtenido - Status: ${preapproval?.status}, External Reference: ${preapproval?.external_reference}`,
    );

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
      // Determinar el ID de empresa a usar
      // Si external_reference existe y no está vacío, usarlo (flujo normal de registro)
      // Si external_reference está vacío, usar empresaId de los parámetros (suscripción creada manualmente)
      const empresaIdToUse =
        preapproval.external_reference &&
        preapproval.external_reference.trim() !== ""
          ? preapproval.external_reference
          : data.empresaId;

      console.log(
        `[SUCCESS SUSCRIBER] Empresa ID a usar: ${empresaIdToUse} (from external_reference: ${!!preapproval.external_reference})`,
      );

      if (empresaIdToUse) {
        // --- CAMBIO CLAVE ---
        // Se llama a la función con los dos argumentos por separado,
        // tal como `createCompanyAndAdmin` los espera.
        const creationResult = await createCompanyAndAdmin(
          empresaIdToUse,
          data.preapproval_id, // Este es el preapprovalId que guardaremos
        );

        if (!creationResult.ok) {
          console.error(creationResult.error);
          return { success: false, error: creationResult.error };
        }

        console.log(`[SUCCESS SUSCRIBER] Empresa y admin creados exitosamente`);
        return { success: true };
      } else {
        return {
          success: false,
          error:
            "No se pudo determinar el ID de empresa. Por favor, intenta nuevamente.",
        };
      }
    }

    return { success: false, error: "Estado de pago no válido." };
  } catch (error) {
    console.error("Error al procesar el pago de Mercado Pago:", error);
    return { success: false, error: "Error al procesar el pago." };
  }
}
