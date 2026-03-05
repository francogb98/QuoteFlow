"use server";

import { auth } from "@/*";
import { iniciarSuscripcionEmpresa } from "@/01-actions/payment/update-suscription";
import { TipoPlanEmpresa, FrecuenciaPago } from "@prisma/client";

export async function crearSuscripcion(
  plan: TipoPlanEmpresa,
  frecuencia: FrecuenciaPago,
) {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  return iniciarSuscripcionEmpresa({
    empresaId: session.user.empresaId,
    adminEmail: session.user.email,
    planTipo: plan,
    frecuenciaPago: frecuencia,
  });
}
