"use server";
import { PrismaClient } from "@prisma/client";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

const prisma = globalThis.prismaGlobal || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

async function migrar() {
  try {
    const empresas = await prisma.empresa.findMany({
      include: { suscripcion: true },
    });

    for (const empresa of empresas) {
      if (!empresa.suscripcion) {
        await prisma.suscripcionEmpresa.create({
          data: {
            empresaId: empresa.id,
            planTipo: empresa.planTipo,
            frecuenciaPago: empresa.frecuenciaPago,
            estadoSuscripcion: "TRIAL",
            fechaFinPeriodoActual: new Date("2026-04-01"),
          },
        });

        console.log(`✔ Migrada empresa: ${empresa.nombre}`);
      }
    }

    console.log("✅ Migración completada");
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

migrar();
