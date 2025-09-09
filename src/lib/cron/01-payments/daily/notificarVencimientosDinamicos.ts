"use server";

import { differenceInCalendarDays, endOfDay, startOfDay } from "date-fns";
import { sendReminderEmail } from "@/01-actions/admin/emails/sendReminderEmail";
import prisma from "@/lib/prisma";

export async function notificarVencimientosDinamicos(fechaActual: Date) {
  console.log(
    `[v0] Iniciando notificaciones dinámicas para fecha: ${fechaActual.toISOString()}`
  );
  let notificacionesEnviadas = 0;

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
        include: {
          pagos: {
            where: {
              estado: "PENDIENTE", // Solo pagos pendientes
              mes: fechaActual.getMonth() + 1,
              año: fechaActual.getFullYear(),
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
      if (!usuario.fechaInicioMembresia) {
        console.log(
          `[v0] Usuario ${usuario.nombre} no tiene fecha de inicio de membresía`
        );
        continue;
      }

      const pagoPendiente = usuario.pagos.find((p) => p.estado === "PENDIENTE");
      if (!pagoPendiente || !pagoPendiente.fechaVencimiento) {
        console.log(
          `[v0] Usuario ${usuario.nombre} no tiene pagos pendientes con fecha de vencimiento`
        );
        continue;
      }

      const diasFaltantes = differenceInCalendarDays(
        pagoPendiente.fechaVencimiento,
        fechaActual
      );

      console.log(
        `[v0] Usuario ${usuario.nombre}: faltan ${diasFaltantes} días para vencimiento`
      );

      // Solo notificar si faltan exactamente 3 días o vence hoy (0 días)
      if (diasFaltantes !== 3 && diasFaltantes !== 0) {
        continue;
      }

      const notificacionExistente = await prisma.notificacion.findFirst({
        where: {
          usuarioId: usuario.id,
          entidadTipo: "PAGO",
          entidadId: pagoPendiente.id,
          tipo: diasFaltantes === 0 ? "PAGO_VENCIDO" : "PAGO_PROXIMO_VENCER",
          fechaCreacion: {
            gte: startOfDay(fechaActual),
            lte: endOfDay(fechaActual),
          },
        },
      });

      if (!notificacionExistente) {
        const newStatus = diasFaltantes === 0 ? "VENCE_HOY" : "FALTA_3_DIAS";
        const motivo =
          diasFaltantes === 0
            ? "Tu pago vence hoy"
            : `Tu pago vence en ${diasFaltantes} días`;

        console.log(
          `[v0] Enviando email a ${usuario.email || admin.email} - ${motivo}`
        );

        await sendReminderEmail({
          nombre: usuario.nombre,
          apellido: usuario.apellido || "Sin apellido",
          empresa: admin.empresa?.nombre || "Sin empresa",
          documento: usuario.documento,
          to: usuario.email || admin.email,
          newStatus,
          motivo,
        });

        await prisma.notificacion.create({
          data: {
            tipo: diasFaltantes === 0 ? "PAGO_VENCIDO" : "PAGO_PROXIMO_VENCER",
            titulo: `Recordatorio de pago - ${admin.empresa?.nombre}`,
            mensaje: motivo,
            usuarioId: usuario.id,
            administradorId: admin.id,
            enviadaPorEmail: true,
            fechaEnvioEmail: fechaActual,
            entidadTipo: "PAGO",
            entidadId: pagoPendiente.id,
          },
        });

        notificacionesEnviadas++;
        console.log(`[v0] Notificación enviada a ${usuario.nombre}`);
      } else {
        console.log(`[v0] Ya existe notificación para ${usuario.nombre} hoy`);
      }
    }
  }

  console.log(
    `[v0] Total notificaciones dinámicas enviadas: ${notificacionesEnviadas}`
  );
  return { notificacionesEnviadas };
}
