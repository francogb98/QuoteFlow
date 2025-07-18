"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import type { Administrador } from "@prisma/client"; // Importa Rol también si lo usas

// Define un nuevo tipo para el subconjunto de campos que realmente se devuelven
export type AdminListItem = Pick<
  Administrador,
  | "id"
  | "nombre"
  | "email"
  | "documento"
  | "telefono"
  | "rol"
  | "estaActivo"
  | "fechaCreacion"
>;

interface GetAdminsResult {
  ok: boolean;
  admins?: AdminListItem[]; // Usa el nuevo tipo aquí
  error?: string;
}

export async function getAdminsByCompany(): Promise<GetAdminsResult> {
  const session = await auth();

  if (!session?.user) {
    return { ok: false, error: "No autenticado." };
  }

  const empresaId = session.user.empresa?.id;

  if (!empresaId) {
    return {
      ok: false,
      error: "No se pudo determinar la empresa del administrador actual.",
    };
  }

  try {
    const admins = await prisma.administrador.findMany({
      where: {
        empresaId: empresaId,
        id: {
          not: session.user.id, // Excluir al propio administrador que está logueado
        },
      },
      orderBy: {
        nombre: "asc",
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        documento: true,
        telefono: true,
        rol: true,
        estaActivo: true,
        fechaCreacion: true,
      },
    });

    // Prisma ya devuelve el tipo correcto basado en el 'select',
    // pero lo casteamos para asegurar que coincida con AdminListItem[]
    return { ok: true, admins: admins as AdminListItem[] };
  } catch (error: any) {
    console.error("Error al obtener administradores por empresa:", error);
    return { ok: false, error: "Error al cargar la lista de administradores." };
  }
}
