"use server";

import { createCompanyAndAdmin } from "./03-createCompanyAndAdmin";

interface CreateTrialAccountResult {
  success: boolean;
  message?: string;
  error?: string;
  empresaId?: string;
}

export async function createTrialAccount(
  tempRegistrationId: string
): Promise<CreateTrialAccountResult> {
  try {
    const result = await createCompanyAndAdmin(tempRegistrationId);

    return {
      success: result.ok,
      message: result.message,
      error: result.error,
      empresaId: result.empresaId,
    };
  } catch (error: any) {
    console.error("Error creando cuenta de prueba:", error);
    return {
      success: false,
      error: "Error al crear la cuenta de prueba",
    };
  }
}
