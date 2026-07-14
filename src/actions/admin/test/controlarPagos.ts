"use server";
import prisma from "@/lib/prisma"; // Ajusta la ruta si es necesario
import { startOfMonth, endOfMonth, addMonths } from "date-fns";

export async function revisarPagosUsuarios() {
  const hoy = new Date();
  const mesActual = hoy.getMonth() + 1; // getMonth() es 0-11
  const añoActual = hoy.getFullYear();

  // Mes siguiente
  const mesSiguienteDate = addMonths(hoy, 1);
  const mesSiguiente = mesSiguienteDate.getMonth() + 1;
  const añoSiguiente = mesSiguienteDate.getFullYear();

  // Paso 1: traer todos los usuarios que tengan un pago PAGO en el mes actual
  const usuariosConPagoActual = await prisma.usuario.findMany({
    include: {
      pagos: true,
    },
    where: {
      pagos: {
        some: {
          mes: mesActual,
          año: añoActual,
          estado: "PAGADO",
        },
      },
    },
  });

  console.log(
    `Usuarios con pago del mes actual (${mesActual}/${añoActual}): ${usuariosConPagoActual.length}`
  );

  for (const usuario of usuariosConPagoActual) {
    // Buscar el pago del mes actual
    const pagoActual = usuario.pagos.find(
      (p) => p.mes === mesActual && p.año === añoActual
    );

    // Buscar pago del mes siguiente
    const pagoMesSiguiente = usuario.pagos.find(
      (p) => p.mes === mesSiguiente && p.año === añoSiguiente
    );

    if (pagoMesSiguiente) {
      console.log(`✅ Usuario: ${usuario.nombre} ${usuario.apellido}`);
      console.log(
        `   Pago mes actual: ${pagoActual?.monto} - Estado: ${pagoActual?.estado} - Fecha: ${pagoActual?.fecha}`
      );
      console.log(
        `   Pago mes siguiente: ${pagoMesSiguiente.monto} - Estado: ${pagoMesSiguiente.estado} - Fecha: ${pagoMesSiguiente.fecha}`
      );
    } else {
      console.log(`⚠️ Usuario: ${usuario.nombre} ${usuario.apellido}`);
      console.log(
        `   Pago mes actual: ${pagoActual?.monto} - Estado: ${pagoActual?.estado} - Fecha: ${pagoActual?.fecha}`
      );
      console.log(
        `   ⚠️ NO tiene pago generado para el mes siguiente (${mesSiguiente}/${añoSiguiente})`
      );
    }
  }
}
