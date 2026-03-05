"use server";
import { auth } from "@/auth.config";
import prisma from "@/lib/prisma";

export const getUsersList = async (
  profesorId: string | undefined | null,
  selectedMonth: number,
  selectedYear: number
) => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Usuario no autenticado");

  try {
    const admin = await prisma.administrador.findUnique({
      where: { id: userId },
      select: { empresaId: true, configuracionTarifa: true },
    });

    if (!admin?.empresaId) throw new Error("Empresa no encontrada");

    const usuariosRaw = await prisma.usuario.findMany({
      where: { administradorId: profesorId || userId },
      include: {
        // Traemos:
        // 1. El pago del mes seleccionado (para el semáforo)
        // 2. O cualquier pago que esté PENDIENTE o VENCIDO (para la terminal de cobro)
        pagos: {
          where: {
            OR: [
              { mes: selectedMonth, año: selectedYear },
              { estado: { in: ["PENDIENTE", "VENCIDO"] } },
            ],
          },
          orderBy: [{ año: "desc" }, { mes: "desc" }],
        },
      },
      orderBy: { apellido: "asc" },
    });

    // Enriquecemos con el último pago exitoso
    const usuarios = await Promise.all(
      usuariosRaw.map(async (u) => {
        const ultimoPagoRealizado = await prisma.pago.findFirst({
          where: { usuarioId: u.id, estado: "PAGADO" },
          orderBy: [{ año: "desc" }, { mes: "desc" }],
          select: { mes: true, año: true },
        });

        // Separamos el pago del mes actual de la lista general para facilitar el uso en el frontend
        const pagoMesSeleccionado = u.pagos.find(
          (p) => p.mes === selectedMonth && p.año === selectedYear
        );

        return {
          ...u,
          ultimoPagoRealizado,
          pagoMesSeleccionado, // Esto ayuda al semáforo de la tabla
        };
      })
    );

    return {
      usuarios,
      tipoConfiguracion: admin.configuracionTarifa?.tipoConfiguracion || null,
    };
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    throw new Error("No se pudo obtener la lista");
  }
};
