"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Rol } from "@prisma/client";
import { auth } from "@/auth"; // Importa la función auth para obtener la sesión

interface CreateAdminData {
  nombre: string;
  documento: string;
  email: string;
  password: string;
  telefono: string;
}

interface CreateAdminResult {
  ok: boolean;
  message?: string;
  error?: string;
}

export async function createAdmin({
  nombre,
  documento,
  email,
  password,
  telefono,
}: CreateAdminData): Promise<CreateAdminResult> {
  // 1. Verificar la sesión y el rol del usuario que invoca la acción
  const session = await auth();
  if (!session?.user || session.user.rol !== Rol.ADMINISTRADOR) {
    return {
      ok: false,
      error:
        "Acceso denegado. Solo administradores principales pueden crear nuevos administradores.",
    };
  }

  const empresaId = session.user.empresa?.id; // Obtener el ID de la empresa del administrador actual

  if (!empresaId) {
    return {
      ok: false,
      error: "No se pudo determinar la empresa del administrador actual.",
    };
  }

  // 2. Validar los datos de entrada
  if (!nombre || !documento || !email || !password || !telefono) {
    return { ok: false, error: "Todos los campos son requeridos." };
  }

  if (password.length < 8) {
    return {
      ok: false,
      error: "La contraseña debe tener al menos 8 caracteres.",
    };
  }

  // 3. Verificar si ya existe un administrador con el mismo documento o email en la misma empresa
  try {
    const existingAdminByDocumento = await prisma.administrador.findFirst({
      where: {
        documento,
        empresaId, // Buscar solo dentro de la misma empresa
      },
    });
    if (existingAdminByDocumento) {
      return {
        ok: false,
        error:
          "Ya existe un administrador con este DNI/documento en tu empresa.",
      };
    }

    const existingAdminByEmail = await prisma.administrador.findFirst({
      where: {
        email,
        empresaId, // Buscar solo dentro de la misma empresa
      },
    });
    if (existingAdminByEmail) {
      return {
        ok: false,
        error: "Ya existe un administrador con este email en tu empresa.",
      };
    }

    // 4. Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Crear el nuevo administrador
    await prisma.administrador.create({
      data: {
        nombre,
        documento,
        email,
        password: hashedPassword,
        telefono,
        rol: Rol.PROFESOR, // Por defecto, los nuevos administradores son PROFESOR. Si necesitas que sean ADMINISTRADOR, cambia esto.
        estaActivo: true, // Explícitamente establecer como activo
        empresa: {
          connect: { id: empresaId },
        },
      },
    });

    return { ok: true, message: "Nuevo administrador creado exitosamente." };
  } catch (error: any) {
    console.error("Error al crear nuevo administrador:", error);
    return {
      ok: false,
      error: error.message || "Error desconocido al crear el administrador.",
    };
  }
}
