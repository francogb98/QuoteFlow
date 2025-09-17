// src/actions/admin/cron/dynamicReminders.ts
"use server";

import {
  addMonths,
  differenceInCalendarDays,
  endOfDay,
  startOfDay,
} from "date-fns";
import { sendReminderEmail } from "@/01-actions/admin/emails/sendReminderEmail";
import prisma from "@/lib/prisma";
import moment from "moment-timezone";

// Función auxiliar para normalizar una fecha a la medianoche de Argentina
const normalizeDateToArgentina = (date: Date) => {
  return moment
    .tz(date, "America/Argentina/Buenos_Aires")
    .startOf("day")
    .toDate();
};

export async function notificarVencimientosDinamicos(fechaActual: Date) {
  console.log(
    `[v0] Iniciando notificaciones dinámicas para fecha: ${fechaActual.toISOString()}`
  );
  let notificacionesEnviadas = 0;

  // Normalizamos la fecha actual a la medianoche de Argentina
  const todayInArgentina = normalizeDateToArgentina(fechaActual);

  const admins = await prisma.administrador.findMany({
    where: {
      configuracionTarifa: {
        tipoConfiguracion: "DINAMICA_POR_FECHA_INGRESO",
        estaActiva: true,
      },
      estaActivo: true,
    },
    include: {
      configuracionTarifa: {
        include: {
          dinamicas: true,
        },
      },
      usuarios: {
        where: {
          // Filtramos usuarios activos y con una fecha de inicio de membresía
          estaActivo: true,
          fechaInicioMembresia: {
            not: null,
          },
        },
        include: {
          pagos: {
            where: {
              // Filtrar pagos pendientes del mes actual
              estado: "PENDIENTE",
              mes: todayInArgentina.getMonth() + 1,
              año: todayInArgentina.getFullYear(),
            },
          },
        },
      },
      empresa: true,
    },
  });

  console.log(
    `[v0] Encontrados ${admins.length} administradores con tarifa dinámica`
  );

  for (const admin of admins) {
    const configDinamica = admin.configuracionTarifa?.dinamicas?.[0];
    if (!configDinamica) {
      console.log(`[v0] Admin ${admin.nombre} no tiene configuración dinámica`);
      continue;
    }

    console.log(
      `[v0] Procesando ${admin.usuarios.length} usuarios para admin ${admin.nombre}`
    );

    for (const usuario of admin.usuarios) {
      // Normalizamos la fecha de inicio del usuario
      const fechaInicio = normalizeDateToArgentina(
        new Date(usuario.fechaInicioMembresia as Date)
      );

      // Calculamos la fecha de vencimiento para el mes actual
      let fechaVencimiento = new Date(
        todayInArgentina.getFullYear(),
        todayInArgentina.getMonth(),
        fechaInicio.getDate()
      );

      // Si la fecha de vencimiento es anterior a hoy, la pasamos al próximo mes
      if (fechaVencimiento < todayInArgentina) {
        fechaVencimiento = addMonths(fechaVencimiento, 1);
      }

      // Calculamos los días restantes
      const diasFaltantes = differenceInCalendarDays(
        startOfDay(fechaVencimiento),
        startOfDay(todayInArgentina)
      );

      console.log(
        `[v1] Usuario ${usuario.nombre}: fechaInicio=${fechaInicio.toDateString()} | fechaVencimiento=${fechaVencimiento.toDateString()} | faltan ${diasFaltantes} días`
      );

      // Solo notificar si faltan 3 días o vence hoy
      if (diasFaltantes !== 3 && diasFaltantes !== 0) {
        continue;
      }

      const newStatus = diasFaltantes === 0 ? "VENCE_HOY" : "FALTA_3_DIAS";
      const motivo =
        diasFaltantes === 0
          ? "Tu pago vence hoy"
          : `Tu pago vence en ${diasFaltantes} días`;

      console.log(
        `[v1] Enviando email a ${usuario.email || admin.email} - ${motivo}`
      );

      // Enviar el correo solo si el usuario tiene un pago pendiente para este mes y año
      const tienePagoPendiente = usuario.pagos.length > 0;
      if (tienePagoPendiente) {
        await sendReminderEmail({
          nombre: usuario.nombre,
          apellido: usuario.apellido || "Sin apellido",
          empresa: admin.empresa?.nombre || "Sin empresa",
          documento: usuario.documento,
          to: usuario.email || admin.email,
          newStatus,
          motivo,
        });

        notificacionesEnviadas++;
        console.log(`[v1] Notificación enviada a ${usuario.nombre}`);
      }
    }
  }

  console.log(
    `[v0] Total notificaciones dinámicas enviadas: ${notificacionesEnviadas}`
  );
  return { notificacionesEnviadas };
}
