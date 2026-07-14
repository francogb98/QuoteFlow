"use server";

import prisma from "@/lib/prisma";
import { differenceInCalendarDays } from "date-fns";
import { sendReminderEmail } from "@/actions/admin/emails/sendReminderEmail";
import {
  getNormalizedBusinessDate,
  calculateDynamicDueDate,
} from "../utils/dateUtils";
import { TipoNotificacion } from "@prisma/client";

export async function notificarVencimientosDinamicos(fecha?: Date) {
  const fechaActual = fecha || getNormalizedBusinessDate();
  let notificacionesEnviadas = 0;

  const admins = await prisma.administrador.findMany({
    where: {
      // Exclude SUPER_ADMIN ’” not subject to billing or payment notifications
      rol: { not: "SUPER_ADMIN" },
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
              estado: { in: ["PENDIENTE", "VENCIDO"] },
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
    for (const usuario of admin.usuarios) {
      const pago = usuario.pagos[0];
      if (!usuario.fechaInicioMembresia || !pago) continue;

      const fechaVencimiento = calculateDynamicDueDate(
        usuario.fechaInicioMembresia,
        fechaActual,
      );
      const diasFaltantes = differenceInCalendarDays(
        fechaVencimiento,
        fechaActual,
      );

      let debeNotificar = false;
      let tipoNotificacion: TipoNotificacion | null = null;
      let motivo = "";

      // --- CASO 1: Faltan 3 días ---
      if (pago.estado === "PENDIENTE" && diasFaltantes === 3) {
        const existeRecordatorio = await prisma.notificacion.findFirst({
          where: {
            pagoId: pago.id,
            tipo: TipoNotificacion.PAGO_PROXIMO_VENCER,
          },
        });

        if (!existeRecordatorio) {
          debeNotificar = true;
          tipoNotificacion = TipoNotificacion.PAGO_PROXIMO_VENCER;
          motivo = "Tu pago vence en 3 días";
        }
      }

      // --- CASO 2: Vencido ---
      if (pago.estado === "VENCIDO") {
        const existeVencido = await prisma.notificacion.findFirst({
          where: { pagoId: pago.id, tipo: TipoNotificacion.PAGO_VENCIDO },
        });

        if (!existeVencido) {
          debeNotificar = true;
          tipoNotificacion = TipoNotificacion.PAGO_VENCIDO;
          motivo = "Tu pago está vencido";
        }
      }

      // --- ENVÑO Y REGISTRO ---
      if (debeNotificar && tipoNotificacion) {
        // Email
        await sendReminderEmail({
          nombre: usuario.nombre,
          apellido: usuario.apellido || "Sin apellido",
          empresa: admin.empresa?.nombre || "Sin empresa",
          documento: usuario.documento,
          to: usuario.email || admin.email,
          newStatus:
            tipoNotificacion === TipoNotificacion.PAGO_VENCIDO
              ? "VENCIDO"
              : "FALTA_3_DIAS",
          motivo,
        });

        // Crear Notificación
        await prisma.notificacion.create({
          data: {
            tipo: tipoNotificacion,
            titulo: `Recordatorio de pago - ${admin.empresa?.nombre}`,
            mensaje: motivo,
            usuarioId: usuario.id,
            remitenteId: admin.id,
            pagoId: pago.id, // Vinculación clave
            fechaEnvioEmail: fechaActual,
          },
        });

        notificacionesEnviadas++;
      }
    }
  }

  return { notificacionesEnviadas };
}
