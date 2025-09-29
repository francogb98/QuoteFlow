import prisma from "@/lib/prisma";
import { generarProximoPago } from "../lib";
import { logger } from "../lib";

export async function generarPagosFuturos(
  fechaActual: Date,
  mesActual: number,
  añoActual: number,
  cronId: string
) {
  let pagosGenerados = 0;
  const proximoMes = mesActual === 12 ? 1 : mesActual + 1;
  const proximoAño = mesActual === 12 ? añoActual + 1 : añoActual;

  const usuariosActivos = await prisma.usuario.findMany({
    where: {
      estado: "ACTIVO",
      estaActivo: true,
      NOT: {
        pagos: {
          some: {
            mes: { in: [mesActual, proximoMes] },
            año: { in: [añoActual, proximoAño] },
            estado: "PENDIENTE",
          },
        },
      },
    },
    include: {
      administrador: {
        include: { configuracionTarifa: { include: { rangos: true } } },
      },
      pagos: {
        where: { estado: "PAGADO" },
        orderBy: { fecha: "desc" },
        take: 1,
      },
    },
  });

  logger.info(
    `[${cronId}] 👥 Encontrados ${usuariosActivos.length} usuarios para generar pagos futuros`
  );

  const resultados = await Promise.allSettled(
    usuariosActivos.map(async (usuario) => {
      const configuracion = usuario.administrador.configuracionTarifa;
      const ultimoPagoPagado = usuario.pagos[0];
      if (!configuracion || !ultimoPagoPagado) {
        if (!configuracion)
          logger.warn(
            `[${cronId}] ⚠️ Usuario ${usuario.nombre} sin configuración de tarifa`
          );
        if (!ultimoPagoPagado)
          logger.warn(
            `[${cronId}] ⚠️ Usuario ${usuario.nombre} sin pagos pagados`
          );
        return 0;
      }

      try {
        const proximoPagoMes =
          ultimoPagoPagado.mes === 12 ? 1 : ultimoPagoPagado.mes + 1;
        const proximoPagoAño =
          ultimoPagoPagado.mes === 12
            ? ultimoPagoPagado.año + 1
            : ultimoPagoPagado.año;
        const fechaProximoPago = new Date(
          proximoPagoAño,
          proximoPagoMes - 1,
          1
        );

        const nuevoPago = await generarProximoPago(
          usuario,
          configuracion,
          ultimoPagoPagado,
          fechaProximoPago
        );

        if (nuevoPago) {
          logger.debug(
            `[${cronId}] ✅ Pago futuro generado: ${usuario.nombre} - ${nuevoPago.periodo}`
          );
          return 1;
        }
        return 0;
      } catch (error) {
        logger.error(
          `[${cronId}] ❌ Error generando pago futuro para ${usuario.nombre}:`,
          error
        );
        return 0;
      }
    })
  );

  pagosGenerados += resultados.reduce(
    (acc, r) => (r.status === "fulfilled" ? acc + r.value : acc),
    0
  );

  return { pagosGenerados };
}
