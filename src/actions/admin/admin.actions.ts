"use server";

import { auth } from "@/auth"; // Asumiendo que esta es tu configuración de NextAuth.js
import prisma from "@/lib/prisma";

export async function editAdmin(data: any) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        ok: false,
        error: "No autenticado. ID de usuario no disponible.",
      };
    }

    const adminId = session.user.id;

    const currentAdmin = await prisma.administrador.findUnique({
      where: { id: adminId },
      select: {
        nombre: true,
        documento: true,
        email: true,
        empresaId: true,
        empresa: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    if (!currentAdmin) {
      return {
        ok: false,
        error: "Administrador no encontrado.",
      };
    }

    if (data.nombre !== undefined && data.nombre === currentAdmin.nombre) {
      delete data.nombre;
    }

    if (data.email !== undefined && data.email === currentAdmin.email) {
      delete data.email;
    }

    if (
      data.documento !== undefined &&
      data.documento === currentAdmin.documento
    ) {
      delete data.documento;
    }

    const currentEmpresaNombre = currentAdmin.empresa?.nombre || "";
    if (data.empresa !== undefined && data.empresa === currentEmpresaNombre) {
      delete data.empresa;
    }

    const updateData: any = {}; // Objeto para almacenar solo los campos que se van a actualizar
    let empresaWasUpdatedDirectly = false;

    if (data.nombre !== undefined) {
      updateData.nombre = data.nombre;
    }

    if (data.email !== undefined) {
      const isEmailExistente = await prisma.administrador.findUnique({
        where: { email: data.email },
      });
      if (isEmailExistente && isEmailExistente.id !== adminId) {
        return {
          ok: false,
          error: "El email ya existe para otro usuario.",
        };
      }
      updateData.email = data.email;
    }

    if (data.documento !== undefined) {
      const isDocumentoExistente = await prisma.administrador.findUnique({
        where: { documento: data.documento },
      });
      if (isDocumentoExistente && isDocumentoExistente.id !== adminId) {
        return {
          ok: false,
          error: "El documento ya existe para otro usuario.",
        };
      }
      updateData.documento = data.documento;
    }

    if (data.empresa !== undefined) {
      if (data.empresa === "") {
        if (currentAdmin.empresaId) {
          updateData.empresa = { disconnect: true };
          empresaWasUpdatedDirectly = true; // Se realizó una acción sobre la empresa
        }
      } else {
        if (data.empresa !== currentEmpresaNombre) {
          const existingCompanyWithNewName = await prisma.empresa.findUnique({
            where: { nombre: data.empresa },
          });

          if (
            existingCompanyWithNewName &&
            existingCompanyWithNewName.id !== currentAdmin.empresaId
          ) {
            return {
              ok: false,
              error: "El nombre de la empresa ya existe para otra empresa.",
            };
          }

          if (currentAdmin.empresaId && currentAdmin.empresa?.id) {
            await prisma.empresa.update({
              where: { id: currentAdmin.empresa.id }, // Usar el ID de la empresa actual
              data: { nombre: data.empresa },
            });
            empresaWasUpdatedDirectly = true;
          } else {
            // esto es un caso no cubierto por la solicitud de renombrar.
            return {
              ok: false,
              error:
                "No se puede actualizar el nombre de la empresa si el administrador no tiene una empresa asociada. Por favor, asocie una empresa primero o cree una nueva si es necesario (funcionalidad no implementada aquí).",
            };
          }
        }
      }
    }

    if (Object.keys(updateData).length === 0 && !empresaWasUpdatedDirectly) {
      return {
        ok: true,
        data: currentAdmin, // Devuelve los datos actuales ya que no hubo cambios
        message: "No se detectaron cambios para actualizar.",
      };
    }

    const updatedAdmin = await prisma.administrador.update({
      where: { id: adminId },
      data: updateData, // Solo los campos que cambiaron
      include: {
        empresa: true, // Incluir los datos de la empresa en la respuesta para actualizar la sesión
      },
    });

    return {
      ok: true,
      data: updatedAdmin,
    };
  } catch (error: any) {
    console.error("Error al editar el administrador:", error.message);
    return {
      ok: false,
      error: "Error al editar el administrador: " + error.message, // Mensaje de error más específico
    };
  }
}
