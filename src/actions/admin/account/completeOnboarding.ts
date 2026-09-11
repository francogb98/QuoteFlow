"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/*";
import { invalidateAdminCache } from "@/lib/auth/get-admin";
import { ActionResponse, handleActionError } from "@/lib/utils/action-errors";

export async function completeOnboarding(): Promise<ActionResponse<null>> {
  try {
    const session = await auth();
    const id = session?.user?.id;

    if (!id) {
      return { ok: false, error: "No autenticado." };
    }

    await prisma.administrador.update({
      where: { id },
      data: { onboardingCompletado: true },
    });

    invalidateAdminCache(id);

    return { ok: true, data: null, message: "Onboarding completado." };
  } catch (error: any) {
    return handleActionError(error, "Error al completar onboarding");
  }
}
