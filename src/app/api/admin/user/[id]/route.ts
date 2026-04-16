import { auth } from "@/auth.config";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

interface Segments {
  params: Promise<{
    id: string;
  }>;
}

/** ----------------------------------------------------
 *  Función para obtener el usuario
 * ---------------------------------------------------- */
const getUser = async (id: string) => {
  const user = await prisma.usuario.findUnique({
    where: { id },
    include: {
      administrador: {
        select: {
          id: true,
          nombre: true,
          configuracionTarifa: true,
        },
      },
      pagos: {
        orderBy: { fecha: "desc" },
        take: 30,
      },
      rangoTarifa: true,
      dinamicaTarifa: true,
    },
  });

  return user;
};

/** ----------------------------------------------------
 *  Método GET — mismo formato que tu ejemplo de TODO
 * ---------------------------------------------------- */
export async function GET(request: Request, { params }: Segments) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const user = await getUser(id);

    if (!user) {
      return NextResponse.json(
        { message: `Usuario con id ${id} no existe` },
        { status: 404 },
      );
    }

    // Verificar que el usuario pertenece al admin autenticado
    if (user.administradorId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error en user detail:", error);
    return NextResponse.json(
      { message: "Error al obtener detalle del usuario" },
      { status: 500 },
    );
  }
}
