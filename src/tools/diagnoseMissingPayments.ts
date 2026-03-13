import prisma from "@/lib/prisma";

const IDS = [
  "e93adbd7-2e52-48af-9a24-e28bdeff35cc",
  "2b4257c1-b44b-4f27-b4d9-7f43682a94ca",
  "bde440b2-8e92-4eaf-95d2-1f49269de4b0",
];

function isFiniteNumber(v: any) {
  return Number.isFinite(Number(v));
}

async function diagnose(ids: string[]) {
  const results: any[] = [];

  for (const id of ids) {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      include: {
        administrador: {
          include: {
            configuracionTarifa: {
              include: { rangos: true, dinamicas: true },
            },
          },
        },
        pagos: { orderBy: { fecha: "desc" }, take: 1 },
        rangoTarifa: true,
        dinamicaTarifa: true,
      },
    });

    if (!usuario) {
      results.push({ id, ok: false, reason: "usuario_no_encontrado" });
      continue;
    }

    const admin = usuario.administrador ?? null;
    const configuracion = admin?.configuracionTarifa ?? null;
    const ultimoPago =
      usuario.pagos && usuario.pagos.length > 0 ? usuario.pagos[0] : null;

    const entry: any = {
      id: usuario.id,
      nombre: usuario.nombre,
      estaActivo: usuario.estaActivo,
      estadoUsuario: usuario.estado ?? null,
      adminId: admin?.id ?? null,
      adminNombre: admin?.nombre ?? null,
      fechaInicioMembresia: usuario.fechaInicioMembresia ?? null,
      configuracionResumen: configuracion
        ? {
            id: configuracion.id ?? null,
            tipoConfiguracion: configuracion.tipoConfiguracion ?? null,
            rangosCount: Array.isArray(configuracion.rangos)
              ? configuracion.rangos.length
              : null,
            dinamicasCount: Array.isArray(configuracion.dinamicas)
              ? configuracion.dinamicas.length
              : null,
          }
        : null,
      ultimoPago: ultimoPago
        ? {
            id: ultimoPago.id,
            mes: ultimoPago.mes,
            año: ultimoPago.año,
            estado: ultimoPago.estado,
            monto: ultimoPago.monto,
            fecha: ultimoPago.fecha,
          }
        : null,
      existsNextPayment: null,
      candidateMonto: null,
      reasons: [] as string[],
    };

    // 1️⃣ Usuario activo
    if (
      !usuario.estaActivo ||
      String(usuario.estado).toUpperCase() !== "ACTIVO"
    ) {
      entry.reasons.push("usuario_inactivo");
    }

    // 2️⃣ Último pago
    if (!ultimoPago) {
      entry.reasons.push("sin_ultimo_pago");
      results.push(entry);
      continue;
    }

    // 3️⃣ Último pago pagado (opcional)
    if (String(ultimoPago.estado).toUpperCase() !== "PAGADO") {
      entry.reasons.push(`ultimo_pago_no_pagado (${ultimoPago.estado})`);
    }

    // 4️⃣ Existe pago del mes siguiente
    const mesUlt = Number(ultimoPago.mes);
    const añoUlt = Number(ultimoPago.año);
    const proximoMes = mesUlt === 12 ? 1 : mesUlt + 1;
    const proximoAño = mesUlt === 12 ? añoUlt + 1 : añoUlt;

    const existe = await prisma.pago.findFirst({
      where: { usuarioId: usuario.id, mes: proximoMes, año: proximoAño },
      select: { id: true },
    });
    entry.existsNextPayment = !!existe;
    if (existe) {
      entry.reasons.push("pago_siguiente_ya_existe");
      results.push(entry);
      continue;
    }

    // 5️⃣ Calcular monto candidato (orden de prioridad)
    let candidate: number | null = null;
    if (usuario.dinamicaTarifa?.montoBase != null)
      candidate = Number(usuario.dinamicaTarifa.montoBase);
    else if (usuario.rangoTarifa?.monto != null)
      candidate = Number(usuario.rangoTarifa.monto);
    else if (ultimoPago?.monto != null) candidate = Number(ultimoPago.monto);
    else if (configuracion?.rangos?.length)
      candidate = Number(configuracion.rangos[0].monto);
    else if (configuracion?.dinamicas?.length)
      candidate = Number(configuracion.dinamicas[0].montoBase);

    entry.candidateMonto =
      candidate !== null && isFiniteNumber(candidate)
        ? Number(candidate.toFixed(2))
        : null;

    if (candidate === null || !isFiniteNumber(candidate)) {
      entry.reasons.push("monto_invalido_o_no_definido");
    }

    // 6️⃣ Configuración del admin
    if (!configuracion) {
      entry.reasons.push("sin_configuracion_admin");
    }

    // 7️⃣ Resultado final
    if (entry.reasons.length === 0) {
      entry.reasons.push("puede_generarse_si_se_ejecuta_generarProximoPago");
    }

    results.push(entry);
  }

  await prisma.$disconnect();
  process.exit(0);
}

diagnose(IDS).catch((err) => {
  console.error("Error en diagnóstico:", err);
  prisma.$disconnect().finally(() => process.exit(1));
});
