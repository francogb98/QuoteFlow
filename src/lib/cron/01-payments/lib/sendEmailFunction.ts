"use server";

import { sendEmail } from "@/actions/admin/emails/sendEmail";
import { logger } from "../lib";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Busca pagos que vencen en 3 días y envía recordatorios por correo a los usuarios.
 * @param fechaActual La fecha de ejecución actual.
 * @returns Un objeto con el resumen de la acción.
 */
export async function enviarRecordatoriosDePago(fechaActual: Date) {
  const fechaRecordatorio = new Date(fechaActual);
  fechaRecordatorio.setDate(fechaRecordatorio.getDate() + 3);

  const fechaRecordatorioInicio = new Date(fechaRecordatorio);
  fechaRecordatorioInicio.setHours(0, 0, 0, 0);

  const fechaRecordatorioFin = new Date(fechaRecordatorio);
  fechaRecordatorioFin.setHours(23, 59, 59, 999);

  logger.info(
    `ðŸ’Œ [RECORDATORIOS] Buscando pagos que vencen en 3 días (fecha: ${format(
      fechaRecordatorio,
      "dd-MM-yyyy"
    )})...`
  );

  let recordatoriosEnviados = 0;

  try {
    const pagosProximos = await prisma.pago.findMany({
      where: {
        fechaVencimiento: {
          gte: fechaRecordatorioInicio,
          lte: fechaRecordatorioFin,
        },
        estado: "PENDIENTE",
        usuario: {
          email: {
            not: null, // Solo usuarios con correo
            //@ts-ignore
            not: "",
          },
        },
      },
      // NEW: Actualizamos la consulta para obtener el documento del usuario y el nombre de la empresa
      include: {
        usuario: {
          select: {
            nombre: true,
            apellido: true,
            email: true,
            documento: true,
            administrador: {
              select: {
                empresa: {
                  select: {
                    nombre: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (pagosProximos.length === 0) {
      logger.info(
        "ðŸŽ‰ No se encontraron pagos próximos a vencer para enviar recordatorios."
      );
    } else {
      logger.info(
        `ðŸ“¬ Se encontraron ${pagosProximos.length} pagos próximos. Enviando correos...`
      );

      for (const pago of pagosProximos) {
        const { usuario, monto, fechaVencimiento } = pago;
        const fechaVencimientoFormateada = format(
          fechaVencimiento!,
          "dd 'de' MMMM",
          { locale: es }
        );

        // NEW: Obtenemos el nombre de la empresa y el documento del usuario
        const empresaNombre = usuario.administrador.empresa.nombre;
        const documentoUsuario = usuario.documento;

        // NEW: Llamamos a la función `sendEmail` con todos los datos necesarios
        await sendEmail({
          to: usuario.email!,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          dueDate: fechaVencimientoFormateada,
          daysUntilDue: 3,
          empresa: empresaNombre,
          documento: documentoUsuario,
        });

        recordatoriosEnviados++;
        logger.info(
          `Correo enviado a ${usuario.email} para el pago de ${monto}`
        );
      }
    }
  } catch (error) {
    logger.error("âŒ Error al enviar recordatorios de pago:", error);
  }

  return { recordatoriosEnviados };
}
