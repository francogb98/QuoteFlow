"use server";

import prisma from "@/lib/prisma";
import { addMonths, differenceInCalendarDays } from "date-fns";
import { sendReminderEmail } from "@/01-actions/admin/emails/sendReminderEmail";
import {
  getNormalizedBusinessDate,
  calculateDynamicDueDate,
} from "../utils/dateUtils";

export async function notificarVencimientosDinamicos(fecha?: Date) {
  const fechaActual = fecha || getNormalizedBusinessDate();
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
      configuracionTarifa: { include: { dinamicas: true } },
      usuarios: {
        where: { estaActivo: true, fechaInicioMembresia: { not: null } },
        include: {
          pagos: {
            where: {
              estado: "PENDIENTE",
              mes: fechaActual.getMonth() + 1,
              año: fechaActual.getFullYear(),
            },
          },
        },
      },
      empresa: true,
    },
  });

  for (const admin of admins) {
    const configDinamica = admin.configuracionTarifa?.dinamicas?.[0];
    if (!configDinamica) continue;

    for (const usuario of admin.usuarios) {
      if (!usuario.fechaInicioMembresia) continue;

      // Calcular fecha de vencimiento de este mes
      const fechaVencimiento = calculateDynamicDueDate(
        usuario.fechaInicioMembresia,
        fechaActual
      );

      // Días restantes
      const diasFaltantes = differenceInCalendarDays(
        fechaVencimiento,
        fechaActual
      );

      if (diasFaltantes !== 3 && diasFaltantes !== 0) continue;

      const newStatus = diasFaltantes === 0 ? "VENCE_HOY" : "FALTA_3_DIAS";
      const motivo =
        diasFaltantes === 0
          ? "Tu pago vence hoy"
          : `Tu pago vence en ${diasFaltantes} días`;

      // Enviar correo solo si hay pago pendiente
      if (usuario.pagos.length > 0) {
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
      }
    }
  }

  return { notificacionesEnviadas };
}
