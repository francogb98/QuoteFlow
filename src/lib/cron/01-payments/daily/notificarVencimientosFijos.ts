"use server";

import { sendReminderEmail } from "@/01-actions/admin/emails/sendReminderEmail";
import prisma from "@/lib/prisma";
import { endOfDay, startOfDay } from "date-fns";

export async function notificarVencimientosFijos(fechaActual: Date) {
  console.log(
    `[v0] Iniciando notificaciones fijas para fecha: ${fechaActual.toISOString()}`
  );
  let notificacionesEnviadas = 0;

  const adminsFijos = await prisma.administrador.findMany({
    where: {
      configuracionTarifa: {
        tipoConfiguracion: "FIJA_MENSUAL",
        estaActiva: true,
      },
      estaActivo: true,
    },
    include: {
      configuracionTarifa: {
        include: {
          rangos: true,
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
    `[v0] Encontrados ${adminsFijos.length} administradores con tarifa fija`
  );

  for (const admin of adminsFijos) {
    const rangoTarifa = admin.configuracionTarifa?.rangos?.[0];
    if (!rangoTarifa) {
      console.log(
        `[v0] Admin ${admin.nombre} no tiene rango de tarifa configurado`
      );
      continue;
    }

    const diaVencimiento = rangoTarifa.diaFin;
    const diaActual = fechaActual.getDate();

    const esRecordatorio = diaActual === diaVencimiento - 3;
    const esVencimiento = diaActual === diaVencimiento;

    if (!esRecordatorio && !esVencimiento) {
      console.log(
        `[v0] Hoy (día ${diaActual}) no es día de notificación para admin ${admin.nombre} (vence día ${diaVencimiento})`
      );
      continue;
    }

    console.log(
      `[v0] Procesando ${admin.usuarios.length} usuarios para admin ${admin.nombre}`
    );

    for (const usuario of admin.usuarios) {
      const pagoPendiente = usuario.pagos.find((p) => p.estado === "PENDIENTE");

      if (!pagoPendiente) {
        console.log(`[v0] Usuario ${usuario.nombre} no tiene pagos pendientes`);
        continue;
      }

      const notificacionExistente = await prisma.notificacion.findFirst({
        where: {
          usuarioId: usuario.id,
          entidadTipo: "PAGO",
          entidadId: pagoPendiente.id,
          tipo: esVencimiento ? "PAGO_VENCIDO" : "PAGO_PROXIMO_VENCER",
          fechaCreacion: {
            gte: startOfDay(fechaActual),
            lte: endOfDay(fechaActual),
          },
        },
      });

      if (!notificacionExistente) {
        const newStatus = esVencimiento ? "VENCE_HOY" : "FALTA_3_DIAS";
        const motivo = esVencimiento
          ? "Tu pago vence hoy"
          : "Tu pago vence en 3 días";

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
            tipo: esVencimiento ? "PAGO_VENCIDO" : "PAGO_PROXIMO_VENCER",
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
    `[v0] Total notificaciones fijas enviadas: ${notificacionesEnviadas}`
  );
  return { notificacionesEnviadas };
}
