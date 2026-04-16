import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const temp = await prisma.tempRegistration.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        nombreEmpresa: true,
        planTipo: true,
        frecuenciaPago: true,
        // documento, email y telefono se omiten deliberadamente
        // para reducir exposición de PII en endpoint público
      },
    });

    if (!temp) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(temp);
  } catch (err) {
    console.error("GET /api/temp-registration/:id error", err);
    return NextResponse.json(
      { error: "Ocurrió un error al obtener el registro temporal" },
      { status: 500 },
    );
  }
}
