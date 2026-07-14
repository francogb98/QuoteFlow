"use server";

import { addUserToAdmin as addUserToAdminCore } from "@/actions/admin/users/create-user";

export async function addUserToAdmin(data: {
  nombre: string;
  apellido: string;
  documento: string;
  edad?: number;
  telefono?: string;
  correo?: string;
  administradorId: string;
  primerPagoMesSiguiente: boolean;
  fechaInicioMembresia?: Date;
  rangoTarifaId?: string;
  dinamicaTarifaId?: string;
}) {
  const result = await addUserToAdminCore(data);

  if (!result.success) {
    throw new Error(result.message || "Error en el servidor intente nuevamente más tarde.");
  }

  return result.data;
}
