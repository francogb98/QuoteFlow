import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id)
    return NextResponse.json(
      { ok: false, error: "missing id" },
      { status: 400 }
    );

  const user = await prisma.usuario.findUnique({
    where: { id },
    include: {
      administrador: {
        include: {
          configuracionTarifa: {
            include: {
              rangos: true,
              dinamicas: true,
            },
          },
        },
      },
      pagos: {
        orderBy: { fecha: "desc" },
      },
      rangoTarifa: true,
      dinamicaTarifa: true,
    },
  });

  if (!user)
    return NextResponse.json(
      { ok: false, error: "Usuario no encontrado" },
      { status: 404 }
    );

  return NextResponse.json({ ok: true, user });
}
