import { auth } from "@/auth.config";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const administrador = await prisma.administrador.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        nombre: true,
        telefono: true,
        empresa: {
          select: {
            nombre: true,
          },
        },
        configuracionTarifa: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!administrador) {
      return NextResponse.json(
        { error: "Administrador no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      hasConfiguracionTarifa: !!administrador.configuracionTarifa,
      adminData: {
        id: administrador.id,
        nombre: administrador.nombre,
        telefono: administrador.telefono,
        empresaNombre: administrador.empresa.nombre,
      },
    });
  } catch (error) {
    console.error("Error fetching admin config:", error);
    return NextResponse.json(
      { error: "Error al obtener configuración" },
      { status: 500 },
    );
  }
}
