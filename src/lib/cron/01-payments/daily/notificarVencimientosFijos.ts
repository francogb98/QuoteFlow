"use server";

import { sendReminderEmail } from "@/actions/admin/emails/sendReminderEmail";
import prisma from "@/lib/prisma";
import { TipoNotificacion } from "@prisma/client"; // Importamos el Enum

export async function notificarVencimientosFijos(fechaActual: Date) {
  let notificacionesEnviadas = 0;

  const adminsFijos = await prisma.administrador.findMany({
    where: {
      // Exclude SUPER_ADMIN ’” not subject to billing or payment notifications
      rol: { not: "SUPER_ADMIN" },
      configuracionTarifa: {
        tipoConfiguracion: "FIJA_MENSUAL",
        estaActiva: true,
      },
      estaActivo: true,
    },
    include: {
      configuracionTarifa: { include: { rangos: true } },
      usuarios: {
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

  for (const admin of adminsFijos) {
    const rangoTarifa = admin.configuracionTarifa?.rangos?.[0];
    if (!rangoTarifa) continue;

    const diaVencimiento = rangoTarifa.diaFin;
    const diaActual = fechaActual.getDate();

    for (const usuario of admin.usuarios) {
      const pago = usuario.pagos[0]; // Pago actual
      if (!pago) continue;

      let debeNotificar = false;
      let tipoNotificacion: TipoNotificacion | null = null;
      let motivo = "";

      // --- CASO 1: RECORDATORIO (Faltan 3 días) ---
      if (pago.estado === "PENDIENTE" && diaActual === diaVencimiento - 3) {
        // Verificamos si YA existe una notificación de "Proximo a vencer" para ESTE pago
        const existeRecordatorio = await prisma.notificacion.findFirst({
          where: {
            pagoId: pago.id, // Buscamos por ID de Pago
            tipo: TipoNotificacion.PAGO_PROXIMO_VENCER,
          },
        });

        if (!existeRecordatorio) {
          debeNotificar = true;
          tipoNotificacion = TipoNotificacion.PAGO_PROXIMO_VENCER;
          motivo = "Tu pago vence en 3 días";
        }
      }

      // --- CASO 2: VENCIDO ---
      if (pago.estado === "VENCIDO") {
        // Verificamos si YA existe una notificación de "Vencido" para ESTE pago
        const existeVencido = await prisma.notificacion.findFirst({
          where: {
            pagoId: pago.id, // Buscamos por ID de Pago
            tipo: TipoNotificacion.PAGO_VENCIDO,
          },
        });

        if (!existeVencido) {
          debeNotificar = true;
          tipoNotificacion = TipoNotificacion.PAGO_VENCIDO;
          motivo = "Tu pago está vencido";
        }
      }

      // --- ENVÑO Y REGISTRO ---
      if (debeNotificar && tipoNotificacion) {
        // 1. Enviar Email
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

        // 2. Crear Notificación en BD vinculada al Pago
        await prisma.notificacion.create({
          data: {
            tipo: tipoNotificacion,
            titulo: `Recordatorio de pago - ${admin.empresa?.nombre}`,
            mensaje: motivo,
            usuarioId: usuario.id,
            remitenteId: admin.id,
            pagoId: pago.id, // IMPORTANTE: Vincular al pago
            enviadaPorEmail: true,
            fechaEnvioEmail: fechaActual,
          },
        });

        notificacionesEnviadas++;
      }
    }
  }

  return { notificacionesEnviadas };
}
