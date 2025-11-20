import prisma from "@/lib/prisma";
import { generarProximoPago } from "../lib/generarProximoPago";
import { logger } from "../lib/logger";

/**
 * Ejecuta la verificación por usuario (último pago). Sólo registra y devuelve los fallos.
 * Retorna { checked, failures: Array<{ usuarioId, usuarioNombre, adminId, adminNombre, configuracion, ultimoPago, reason }> }
 */
export async function ensureNextMonthPaymentsForPaidUsers(
  referenceDate: Date = new Date(),
  cronId = "ensure-next-month"
) {
  const usuarios = await prisma.usuario.findMany({
    where: { estado: "ACTIVO", estaActivo: true },
    include: {
      administrador: {
        select: { id: true, nombre: true, configuracionTarifa: true },
      },
      pagos: { orderBy: { fecha: "desc" }, take: 1 },
      rangoTarifa: true,
      dinamicaTarifa: true,
    },
  });

  const failures: {
    usuarioId: string;
    usuarioNombre?: string;
    adminId?: string;
    adminNombre?: string;
    configuracion?: any;
    ultimoPago?: any;
    reason: string;
  }[] = [];

  for (const usuario of usuarios) {
    const admin = usuario.administrador;
    const adminId = admin?.id;
    const adminNombre = admin?.nombre;
    const configuracion = admin?.configuracionTarifa ?? null;
    const ultimoPago = usuario.pagos?.[0] ?? null;

    try {
      if (!ultimoPago) {
        // Si no hay último pago, no intentamos generar siguiente; pero lo consideramos fallo según tu criterio
        failures.push({
          usuarioId: usuario.id,
          usuarioNombre: usuario.nombre,
          adminId,
          adminNombre,
          configuracion,
          ultimoPago: null,
          reason: "sin-ultimo-pago",
        });
        continue;
      }

      // Solo intentamos generar si último pago está en estado PAGADO (o cambia según tu criterio)
      if (String(ultimoPago.estado).toUpperCase() !== "PAGADO") {
        // no es candidato a generar, lo saltamos (no lo tratamos como fallo)
        continue;
      }

      // calcular mes/año siguiente al ultimoPago
      const mesUlt = Number(ultimoPago.mes);
      const añoUlt = Number(ultimoPago.año);
      const proximoMes = mesUlt === 12 ? 1 : mesUlt + 1;
      const proximoAño = mesUlt === 12 ? añoUlt + 1 : añoUlt;

      // comprobar existencia
      const existe = await prisma.pago.findFirst({
        where: { usuarioId: usuario.id, mes: proximoMes, año: proximoAño },
        select: { id: true },
      });
      if (existe) continue; // ya existe, todo OK

      // intentar generar
      const fechaProximoPago = new Date(proximoAño, proximoMes - 1, 1);
      const nuevo = await generarProximoPago(
        usuario,
        configuracion,
        ultimoPago,
        fechaProximoPago
      );

      if (!nuevo) {
        // generarProximoPago retornó null -> registrar como fallo con detalle útil
        failures.push({
          usuarioId: usuario.id,
          usuarioNombre: usuario.nombre,
          adminId,
          adminNombre,
          configuracion: configuracion
            ? {
                id: configuracion.id,
                tipoConfiguracion: configuracion.tipoConfiguracion,
                estaActiva: configuracion.estaActiva,
              }
            : null,
          ultimoPago: {
            id: ultimoPago.id,
            mes: ultimoPago.mes,
            año: ultimoPago.año,
            estado: ultimoPago.estado,
            monto: ultimoPago.monto,
          },
          reason: "no-creado", // detalle más extenso está en logs internos de generarProximoPago
        });
      }
    } catch (err: any) {
      // error lanzado: registrar con motivo del throw
      const reason = err?.message ? String(err.message) : "error-inesperado";
      failures.push({
        usuarioId: usuario.id,
        usuarioNombre: usuario.nombre,
        adminId,
        adminNombre,
        configuracion,
        ultimoPago: ultimoPago
          ? {
              id: ultimoPago.id,
              mes: ultimoPago.mes,
              año: ultimoPago.año,
              estado: ultimoPago.estado,
              monto: ultimoPago.monto,
            }
          : null,
        reason,
      });
      // Log minimal para diagnóstico en servidor
      logger.error(
        `[${cronId}] fallo usuario=${usuario.id} admin=${adminId ?? "?"} reason=${reason}`,
        {
          usuario: { id: usuario.id, nombre: usuario.nombre },
          configuracion,
          ultimoPago,
          err,
        }
      );
    }
  }

  return { checked: usuarios.length, failures };
}
