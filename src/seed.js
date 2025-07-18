import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const mesesAnteriores = [
    { mes: 1, año: 2023, estado: "PAGADO" }, // Enero 2023
    { mes: 2, año: 2023, estado: "PAGADO" }, // Febrero 2023
    { mes: 3, año: 2023, estado: "PAGADO" }, // Marzo 2023
    { mes: 4, año: 2023, estado: "VENCIDO" }, // Abril 2023 (vencido)
  ];

  for (const { mes, año, estado } of mesesAnteriores) {
    await prisma.pago.create({
      data: {
        monto: estado === "VENCIDO" ? 1500 : 1000, // Monto mayor si está vencido
        mes,
        año,
        periodo: `${año}-${String(mes).padStart(2, "0")}`,
        usuarioId: "3f6d22d8-978a-46c5-b58b-d665ad8a7f1b",
        estaVencido: estado === "VENCIDO",
        mora: estado === "VENCIDO" ? 300 : null,
        estado: "PAGADO",
        metodo: estado === "PAGADO" ? "MERCADOPAGO" : "EFECTIVO",
        comprobante: estado === "PAGADO" ? "https://comprobante.com/123" : null,
        fecha: new Date(año, mes - 1, estado === "VENCIDO" ? 25 : 15), // Fecha acorde al estado
      },
    });
  }

  console.log("✅ Seed completado:");
  console.log(`- 4 pagos históricos creados`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
