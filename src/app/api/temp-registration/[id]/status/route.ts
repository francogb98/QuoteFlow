import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createCompanyAndAdmin } from "@/01-actions/auth/registration/03-createCompanyAndAdmin";
import { MercadoPagoConfig, PreApproval } from "mercadopago";

const config = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

/**
 * GET /api/temp-registration/[id]/status
 * Consulta el estado de un registro temporal y si la empresa ya fue creada
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: tempRegistrationId } = await params;

    console.log(
      `[TEMP STATUS] Consultando estado para tempRegistrationId: ${tempRegistrationId}`,
    );

    if (!tempRegistrationId) {
      return NextResponse.json(
        { error: "ID de registro temporal requerido" },
        { status: 400 },
      );
    }

    // Buscar el registro temporal
    const tempRegistration = await prisma.tempRegistration.findUnique({
      where: { id: tempRegistrationId },
    });

    console.log(
      `[TEMP STATUS] tempRegistration encontrado: ${!!tempRegistration}`,
    );

    let empresa = null;
    let admin = null;

    if (tempRegistration) {
      // El tempRegistration aún existe, verificar si la empresa fue creada
      empresa = await prisma.empresa.findUnique({
        where: { nombre: tempRegistration.nombreEmpresa },
        select: {
          id: true,
          nombre: true,
          planTipo: true,
          frecuenciaPago: true,
          estaActiva: true,
          estadoPago: true,
          fechaProximoVencimiento: true,
          fechaUltimoPago: true,
          mercadoPagoPreApprovalId: true,
        },
      });

      console.log(
        `[TEMP STATUS] empresa encontrada: ${!!empresa}, estaActiva: ${empresa?.estaActiva}, nombre: ${tempRegistration.nombreEmpresa}`,
      );

      // Si la empresa no existe pero el tempRegistration sí, verificar el estado del pago en Mercado Pago
      if (!empresa) {
        console.log(
          `[TEMP STATUS] Empresa no creada, verificando estado del pago en Mercado Pago`,
        );

        try {
          // Buscar preapprovals por email del payer
          const preApproval = new PreApproval(config);
          const searchResponse = await preApproval.search({
            options: {
              payer_email: tempRegistration.email,
            },
          });

          console.log(
            `[TEMP STATUS] Preapprovals encontrados: ${searchResponse?.results?.length || 0}`,
          );

          // Buscar el preapproval que corresponde a este tempRegistration
          const matchingPreapproval = searchResponse?.results?.find(
            (p: any) => p.external_reference === tempRegistration.id,
          );

          if (matchingPreapproval) {
            console.log(
              `[TEMP STATUS] Preapproval encontrado - Status: ${matchingPreapproval.status}, External Reference: ${matchingPreapproval.external_reference}`,
            );

            // Si el pago está autorizado o activo, crear la empresa y el admin
            if (
              matchingPreapproval.status === "authorized" ||
              matchingPreapproval.status === "active"
            ) {
              console.log(
                `[TEMP STATUS] Pago autorizado/activo, creando empresa y admin`,
              );

              const result = await createCompanyAndAdmin(
                tempRegistration.id,
                matchingPreapproval.id || "",
              );

              if (result.ok) {
                console.log(
                  `[TEMP STATUS] Empresa y admin creados exitosamente: ${result.empresaId}`,
                );

                // Buscar la empresa creada
                empresa = await prisma.empresa.findUnique({
                  where: { id: result.empresaId },
                  select: {
                    id: true,
                    nombre: true,
                    planTipo: true,
                    frecuenciaPago: true,
                    estaActiva: true,
                    estadoPago: true,
                    fechaProximoVencimiento: true,
                    fechaUltimoPago: true,
                  },
                });

                admin = await prisma.administrador.findFirst({
                  where: { empresaId: result.empresaId },
                  select: {
                    id: true,
                    email: true,
                  },
                  take: 1,
                });
              } else {
                console.error(
                  `[TEMP STATUS] Error creando empresa: ${result.error}`,
                );
              }
            } else {
              console.log(
                `[TEMP STATUS] Pago no autorizado/activo: ${matchingPreapproval.status}`,
              );
            }
          } else {
            console.log(
              `[TEMP STATUS] No se encontró preapproval con external_reference: ${tempRegistration.id}`,
            );
          }
        } catch (error) {
          console.error(
            `[TEMP STATUS] Error verificando estado del pago en Mercado Pago:`,
            error,
          );
        }
      }

      // Si la empresa ya existe, buscar el admin
      if (empresa && !admin) {
        admin = await prisma.administrador.findUnique({
          where: { documento: tempRegistration.documento },
          select: {
            id: true,
            email: true,
            empresaId: true,
          },
        });
      }

      console.log(
        `[TEMP STATUS] admin encontrado: ${!!admin}, documento: ${tempRegistration.documento}`,
      );

      console.log(`[TEMP STATUS] isComplete: ${!!empresa && !!admin}`);

      return NextResponse.json({
        ok: true,
        tempRegistration: {
          id: tempRegistration.id,
          nombreEmpresa: tempRegistration.nombreEmpresa,
          planTipo: tempRegistration.planTipo,
          frecuenciaPago: tempRegistration.frecuenciaPago,
          expiresAt: tempRegistration.expiresAt,
        },
        empresa: empresa
          ? {
              id: empresa.id,
              nombre: empresa.nombre,
              planTipo: empresa.planTipo,
              frecuenciaPago: empresa.frecuenciaPago,
              estaActiva: empresa.estaActiva,
              estadoPago: empresa.estadoPago,
              fechaProximoVencimiento: empresa.fechaProximoVencimiento,
              fechaUltimoPago: empresa.fechaUltimoPago,
            }
          : null,
        admin: admin
          ? {
              id: admin.id,
              email: admin.email,
            }
          : null,
        isComplete: !!empresa && !!admin,
      });
    } else {
      // El tempRegistration ya fue eliminado (procesado)
      // Buscar si existe una empresa con el mercadoPagoPreApprovalId igual al tempRegistrationId
      console.log(
        `[TEMP STATUS] tempRegistration eliminado, buscando por mercadoPagoPreApprovalId: ${tempRegistrationId}`,
      );
      empresa = await prisma.empresa.findFirst({
        where: { mercadoPagoPreApprovalId: tempRegistrationId },
        select: {
          id: true,
          nombre: true,
          planTipo: true,
          frecuenciaPago: true,
          estaActiva: true,
          estadoPago: true,
          fechaProximoVencimiento: true,
          fechaUltimoPago: true,
        },
      });

      console.log(
        `[TEMP STATUS] empresa encontrada por mercadoPagoPreApprovalId: ${!!empresa}`,
      );

      if (empresa) {
        // Si encontramos la empresa, buscar el admin asociado
        const empresaWithAdmin = await prisma.empresa.findUnique({
          where: { id: empresa.id },
          include: {
            administradores: {
              select: {
                id: true,
                email: true,
              },
              take: 1,
            },
          },
        });

        admin = empresaWithAdmin?.administradores[0] || null;

        console.log(
          `[TEMP STATUS] admin encontrado por empresa: ${!!admin}, empresaId: ${empresa.id}`,
        );
        console.log(`[TEMP STATUS] isComplete: ${!!empresa && !!admin}`);

        return NextResponse.json({
          ok: true,
          tempRegistration: null,
          empresa: {
            id: empresa.id,
            nombre: empresa.nombre,
            planTipo: empresa.planTipo,
            frecuenciaPago: empresa.frecuenciaPago,
            estaActiva: empresa.estaActiva,
            estadoPago: empresa.estadoPago,
            fechaProximoVencimiento: empresa.fechaProximoVencimiento,
            fechaUltimoPago: empresa.fechaUltimoPago,
          },
          admin: admin
            ? {
                id: admin.id,
                email: admin.email,
              }
            : null,
          isComplete: !!empresa && !!admin,
        });
      } else {
        // No se encontró ni el tempRegistration ni la empresa
        return NextResponse.json(
          { error: "Registro temporal no encontrado o expirado" },
          { status: 404 },
        );
      }
    }
  } catch (error) {
    console.error("[TEMP REGISTRATION STATUS] Error:", error);
    return NextResponse.json(
      { error: "Error al consultar el estado del registro" },
      { status: 500 },
    );
  }
}
