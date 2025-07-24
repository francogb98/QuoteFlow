import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de la base de datos...");

  // 1. Crear códigos promocionales
  console.log("📝 Creando códigos promocionales...");
  const codigosPromocionales = await Promise.all([
    prisma.codigoPromocional.create({
      data: {
        codigo: "PRUEBA2024",
        duracionMeses: 2,
        estaActivo: true,
        fechaExpiracion: new Date("2024-12-31"),
      },
    }),
    prisma.codigoPromocional.create({
      data: {
        codigo: "DESCUENTO50",
        duracionMeses: 3,
        estaActivo: true,
        fechaExpiracion: new Date("2024-11-30"),
      },
    }),
    prisma.codigoPromocional.create({
      data: {
        codigo: "GIMNASIO2024",
        duracionMeses: 1,
        estaActivo: true,
        fechaExpiracion: new Date("2024-10-31"),
      },
    }),
    prisma.codigoPromocional.create({
      data: {
        codigo: "VERANO2024",
        duracionMeses: 4,
        estaActivo: true,
        fechaExpiracion: new Date("2024-09-30"),
      },
    }),
    prisma.codigoPromocional.create({
      data: {
        codigo: "FITNESS2024",
        duracionMeses: 2,
        estaActivo: true,
        fechaExpiracion: new Date("2024-12-15"),
      },
    }),
    prisma.codigoPromocional.create({
      data: {
        codigo: "PROMO30",
        duracionMeses: 1,
        estaActivo: false, // Código inactivo
        fechaExpiracion: new Date("2024-08-31"),
      },
    }),
    prisma.codigoPromocional.create({
      data: {
        codigo: "NUEVOCLIENTE",
        duracionMeses: 2,
        estaActivo: true,
        fechaExpiracion: new Date("2025-01-31"),
      },
    }),
    prisma.codigoPromocional.create({
      data: {
        codigo: "BLACKFRIDAY",
        duracionMeses: 6,
        estaActivo: true,
        fechaExpiracion: new Date("2024-11-29"),
      },
    }),
    prisma.codigoPromocional.create({
      data: {
        codigo: "ANIVERSARIO",
        duracionMeses: 3,
        estaActivo: true,
        fechaExpiracion: new Date("2025-03-31"),
      },
    }),
    prisma.codigoPromocional.create({
      data: {
        codigo: "ESTUDIANTE2024",
        duracionMeses: 12,
        estaActivo: true,
        fechaExpiracion: new Date("2024-12-31"),
      },
    }),
  ]);

  console.log(
    `✅ Creados ${codigosPromocionales.length} códigos promocionales`
  );

  // 2. Crear empresa
  console.log("🏢 Creando empresa...");
  const empresa = await prisma.empresa.create({
    data: {
      nombre: "Gimnasio-FitMax",
      planTipo: "PRO",
      estadoPago: "ACTIVO",
      frecuenciaPago: "MENSUAL",
      fechaUltimoPago: new Date("2024-07-01"),
      fechaProximoVencimiento: new Date("2024-08-01"),
      estaActiva: true,
      esCuentaPrueba: false,
      codigoPromocionalId: codigosPromocionales[0].id, // Usar el primer código promocional
    },
  });

  console.log(`✅ Empresa creada: ${empresa.nombre}`);

  // 3. Crear administrador
  console.log("👤 Creando administrador...");
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const administrador = await prisma.administrador.create({
    data: {
      nombre: "Carlos Rodriguez",
      documento: "12345678",
      email: "admin@fitmax.com",
      password: hashedPassword,
      telefono: "+54911234567",
      rol: "ADMINISTRADOR",
      estaActivo: true,
      empresaId: empresa.id,
      claveMercadoPago: "TEST-1234567890",
    },
  });

  console.log(`✅ Administrador creado: ${administrador.nombre}`);

  // 4. Crear configuración de tarifa
  console.log("💰 Creando configuración de tarifa...");
  const configuracionTarifa = await prisma.configuracionTarifa.create({
    data: {
      administradorId: administrador.id,
      estaActiva: true,
      rangos: {
        create: [
          {
            diaInicio: 1,
            diaFin: 10,
            monto: 15000,
          },
          {
            diaInicio: 11,
            diaFin: 20,
            monto: 18000,
          },
          {
            diaInicio: 21,
            diaFin: 31,
            monto: 20000,
          },
        ],
      },
    },
  });

  console.log("✅ Configuración de tarifa creada");

  // 5. Crear usuarios
  console.log("👥 Creando usuarios...");
  const nombres = [
    "Ana García",
    "Luis Martínez",
    "María López",
    "Juan Pérez",
    "Carmen Ruiz",
    "Pedro Sánchez",
    "Laura Fernández",
    "Miguel Torres",
    "Isabel Moreno",
    "David Jiménez",
    "Elena Vargas",
    "Roberto Silva",
    "Patricia Herrera",
    "Fernando Castro",
    "Mónica Ortega",
    "Alejandro Ramos",
    "Cristina Delgado",
    "Javier Molina",
    "Beatriz Guerrero",
    "Andrés Medina",
    "Lucía Romero",
    "Sergio Navarro",
    "Pilar Domínguez",
    "Raúl Vázquez",
    "Natalia Aguilar",
  ];

  const usuarios = [];
  for (let i = 0; i < 25; i++) {
    const usuario = await prisma.usuario.create({
      data: {
        nombre: nombres[i].split(" ")[0],
        apellido: nombres[i].split(" ")[1],
        documento: `2000000${i.toString().padStart(2, "0")}`,
        telefono: `+5491123456${i.toString().padStart(2, "0")}`,
        edad: Math.floor(Math.random() * 40) + 18, // Edad entre 18 y 58
        estado: Math.random() > 0.1 ? "ACTIVO" : "INACTIVO", // 90% activos
        administradorId: administrador.id,
        estaActivo: true,
      },
    });
    usuarios.push(usuario);
  }

  console.log(`✅ Creados ${usuarios.length} usuarios`);

  // 6. Crear pagos para cada usuario
  console.log("💳 Creando pagos...");
  const metodosDisponibles = [
    "EFECTIVO",
    "MERCADOPAGO",
    "TRANSFERENCIA",
    "TARJETA",
  ];
  const estadosDisponibles = ["PAGADO", "PENDIENTE", "VENCIDO"];

  let totalPagos = 0;
  for (const usuario of usuarios) {
    // Crear 5 pagos por usuario
    for (let i = 0; i < 5; i++) {
      const fechaBase = new Date();
      fechaBase.setMonth(fechaBase.getMonth() - i); // Pagos de los últimos 5 meses

      const mes = fechaBase.getMonth() + 1;
      const año = fechaBase.getFullYear();
      const periodo = `${año}-${mes.toString().padStart(2, "0")}`;

      // Determinar monto basado en el día del mes
      const dia = Math.floor(Math.random() * 31) + 1;
      let monto = 15000; // Por defecto
      if (dia >= 1 && dia <= 10) monto = 15000;
      else if (dia >= 11 && dia <= 20) monto = 18000;
      else monto = 20000;

      // Agregar variación aleatoria al monto
      monto += Math.floor(Math.random() * 2000) - 1000; // ±1000

      const estado =
        estadosDisponibles[
          Math.floor(Math.random() * estadosDisponibles.length)
        ];
      const metodo =
        metodosDisponibles[
          Math.floor(Math.random() * metodosDisponibles.length)
        ];

      await prisma.pago.create({
        data: {
          monto: monto,
          fecha: fechaBase,
          mes: mes,
          año: año,
          periodo: periodo,
          usuarioId: usuario.id,
          estado: estado as any,
          metodo: metodo as any,
          estaVencido: estado === "VENCIDO",
          comprobante:
            metodo === "MERCADOPAGO"
              ? `MP-${Math.random().toString(36).substr(2, 9)}`
              : null,
        },
      });
      totalPagos++;
    }
  }

  console.log(`✅ Creados ${totalPagos} pagos`);

  // 7. Crear algunos logs de auditoría
  console.log("📋 Creando logs de auditoría...");
  const auditLogs = await Promise.all([
    prisma.auditLog.create({
      data: {
        action: "CREATE_USER",
        entityType: "USER",
        entityId: usuarios[0].id,
        details: `Usuario ${usuarios[0].nombre} ${usuarios[0].apellido} creado`,
        ipAddress: "192.168.1.100",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        administradorId: administrador.id,
      },
    }),
    prisma.auditLog.create({
      data: {
        action: "UPDATE_MERCADOPAGO_TOKEN",
        entityType: "ADMIN",
        entityId: administrador.id,
        details: "Token de MercadoPago actualizado",
        ipAddress: "192.168.1.100",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        administradorId: administrador.id,
      },
    }),
    prisma.auditLog.create({
      data: {
        action: "CREATE_PAYMENT",
        entityType: "PAYMENT",
        entityId: "payment-example-id",
        details: "Pago registrado por $18000",
        ipAddress: "192.168.1.101",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)",
        administradorId: administrador.id,
      },
    }),
  ]);

  console.log(`✅ Creados ${auditLogs.length} logs de auditoría`);

  // Resumen final
  console.log("\n🎉 Seed completado exitosamente!");
  console.log("📊 Resumen:");
  console.log(`   • 1 Empresa: ${empresa.nombre}`);
  console.log(`   • 1 Administrador: ${administrador.nombre}`);
  console.log(`   • ${usuarios.length} Usuarios`);
  console.log(`   • ${totalPagos} Pagos`);
  console.log(`   • ${codigosPromocionales.length} Códigos promocionales`);
  console.log(`   • ${auditLogs.length} Logs de auditoría`);
  console.log(`   • 1 Configuración de tarifa con 3 rangos`);
}

main()
  .catch((e) => {
    console.error("❌ Error durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
