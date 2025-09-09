import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { addDays, format } from "date-fns";

const prisma = new PrismaClient();

async function seed() {
  console.log("🧹 Limpiando la base de datos...");
  await prisma.notificacion.deleteMany();
  await prisma.pago.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.administrador.deleteMany();
  await prisma.rangoTarifa.deleteMany();
  await prisma.configuracionDinamicaTarifa.deleteMany();
  await prisma.configuracionTarifa.deleteMany();
  await prisma.empresa.deleteMany();

  console.log("🌱 Creando seed...");

  //hashea 2 passwords "123456"
  const hashedPassword = await hash("123456", 10);
  const hashedPassword2 = await hash("123456", 10);

  const admins = [
    {
      nombre: "Juan Perez",
      empresa: "Gimnasio FitLife",
      email: "francobaudino@gmail.com",
      tipoTarifa: "FIJA_MENSUAL",
      documento: "12345678",
      password: hashedPassword,
    },
    {
      nombre: "Maria Gomez",
      empresa: "Gimnasio Rangers",
      email: "francobaudino98@gmail.com",
      tipoTarifa: "DINAMICA_POR_FECHA_INGRESO",
      documento: "12345677",
      password: hashedPassword2,
    },
  ];

  const nombres = [
    "Lucas",
    "Sofia",
    "Mateo",
    "Valentina",
    "Agustin",
    "Camila",
    "Thiago",
    "Isabella",
    "Benjamin",
    "Emma",
  ];
  const apellidos = [
    "Gonzalez",
    "Rodriguez",
    "Lopez",
    "Perez",
    "Gomez",
    "Martinez",
    "Sanchez",
    "Torres",
    "Hernandez",
    "Gutierrez",
  ];

  for (const adminData of admins) {
    const empresa = await prisma.empresa.create({
      data: { nombre: adminData.empresa },
    });

    const configTarifa = await prisma.configuracionTarifa.create({
      data: {
        tipoConfiguracion: adminData.tipoTarifa as any,
        estaActiva: true,
      },
    });

    if (adminData.tipoTarifa === "DINAMICA_POR_FECHA_INGRESO") {
      await prisma.configuracionDinamicaTarifa.create({
        data: {
          configuracionTarifaId: configTarifa.id,
          diasGracia: 5, // 5 días de gracia después del vencimiento
          montoRecargo: 18000, // recargo fijo de 180
          montoBase: 15000,
          nombre: "Tarifa Dinámica Estándar",
        },
      });
    }

    if (adminData.tipoTarifa === "FIJA_MENSUAL") {
      await prisma.rangoTarifa.create({
        data: {
          configuracionTarifaId: configTarifa.id,
          diaInicio: 1, // comienza el día 1 de cada mes
          diaFin: 11, // vence el día 11   de cada mes
          monto: 1000,
          nombre: "Mensualidad Básica",
        },
      });
    }

    const admin = await prisma.administrador.create({
      data: {
        nombre: adminData.nombre,
        email: adminData.email,
        password: adminData.password,
        telefono: "11111111",
        documento: adminData.documento,
        empresaId: empresa.id,
        configuracionTarifaId: configTarifa.id,
      },
    });

    console.log(
      `👤 Creando usuarios para ${adminData.nombre} (${adminData.tipoTarifa})`
    );

    // Crear 10 usuarios con escenarios específicos de testing
    for (let i = 0; i < 10; i++) {
      let fechaInicioMembresia = new Date();
      let estadoPago: "PENDIENTE" | "PAGADO" = "PENDIENTE";
      let fechaVencimiento = new Date();

      if (adminData.tipoTarifa === "DINAMICA_POR_FECHA_INGRESO") {
        switch (i) {
          case 0: // Vence en 3 días (debe enviar recordatorio)
            fechaInicioMembresia = addDays(new Date(), -27); // 30 días - 3 días
            fechaVencimiento = addDays(new Date(), 3);
            break;
          case 1: // Vence hoy (debe enviar notificación de vencimiento)
            fechaInicioMembresia = addDays(new Date(), -30);
            fechaVencimiento = new Date();
            break;
          case 2: // Ya pagado (no debe enviar nada)
            fechaInicioMembresia = addDays(new Date(), -35);
            fechaVencimiento = addDays(new Date(), -5);
            estadoPago = "PAGADO";
            break;
          case 3: // Vencido hace 2 días (debe enviar recordatorio urgente)
            fechaInicioMembresia = addDays(new Date(), -32);
            fechaVencimiento = addDays(new Date(), -2);
            break;
          default: // Futuro (no debe enviar nada)
            fechaInicioMembresia = addDays(new Date(), -10);
            fechaVencimiento = addDays(new Date(), 20);
        }
      } else {
        const hoy = new Date();
        const diaActual = hoy.getDate();

        switch (i) {
          case 0:
          case 1: // Vencen en 3 días (si hoy es día 7)
            if (diaActual <= 7) {
              fechaVencimiento = new Date(
                hoy.getFullYear(),
                hoy.getMonth(),
                10
              );
            } else {
              fechaVencimiento = new Date(
                hoy.getFullYear(),
                hoy.getMonth() + 1,
                10
              );
            }
            break;
          case 2:
          case 3: // Vencen hoy (si hoy es día 10)
            fechaVencimiento = new Date(hoy.getFullYear(), hoy.getMonth(), 10);
            break;
          case 4: // Ya pagado
            fechaVencimiento = new Date(hoy.getFullYear(), hoy.getMonth(), 10);
            estadoPago = "PAGADO";
            break;
          default: // Futuro
            fechaVencimiento = new Date(
              hoy.getFullYear(),
              hoy.getMonth() + 1,
              10
            );
        }
      }

      const usuario = await prisma.usuario.create({
        data: {
          nombre: nombres[i],
          apellido: apellidos[i],
          documento: `DNI${i + 1}-${admin.nombre.replace(" ", "")}`,
          email: "francobaudino98@gmail.com", // Usar el mismo email para testing
          administradorId: admin.id,
          fechaInicioMembresia,
        },
      });

      await prisma.pago.create({
        data: {
          usuarioId: usuario.id,
          monto: 1000,
          mes: fechaVencimiento.getMonth() + 1,
          año: fechaVencimiento.getFullYear(),
          estado: estadoPago,
          fechaVencimiento,
          periodo: format(fechaVencimiento, "yyyy-MM"),
        },
      });

      console.log(
        `  ✓ Usuario ${i + 1}: ${nombres[i]} ${apellidos[i]} - Vence: ${format(fechaVencimiento, "dd/MM/yyyy")} - Estado: ${estadoPago}`
      );
    }
  }

  console.log("✅ Seed completado.");
}

async function main() {
  try {
    await seed();
  } catch (error) {
    console.error("❌ Error general:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
