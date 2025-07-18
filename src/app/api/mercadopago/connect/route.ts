import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

import api from "../../../../actions/actions/api";

import { auth } from "@/*";
import { encrypt } from "@/lib";
import { validateMercadoPagoToken } from "@/lib";

export async function GET(request: NextRequest) {
  try {
    // 1. Validación del código de autorización
    const code = request.nextUrl.searchParams.get("code");
    const session = await auth();

    if (!code) {
      throw new Error("Código de autorización no proporcionado");
    }

    if (!session?.user) {
      throw new Error("Usuario no autenticado");
    }

    // 2. Obtener credenciales
    const credentials = await api.user.connect(code);
    if (!credentials?.access_token) {
      throw new Error("No se pudo obtener el token de acceso");
    }

    console.log(credentials);

    // 3. Validar el token
    const isValid = await validateMercadoPagoToken(credentials.access_token);
    if (!isValid) {
      throw new Error("Token de Mercado Pago inválido");
    }

    // 4. Encriptar tokens
    const encryptedAccessToken = encrypt(credentials.access_token);
    const encryptedRefreshToken = credentials.refresh_token
      ? encrypt(credentials.refresh_token)
      : null;

    // 5. Obtener información de la solicitud para el log
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent");

    // 6. Transacción para actualizar y crear log
    const [adminUpdate, auditLog] = await prisma.$transaction([
      prisma.administrador.update({
        where: { id: session.user.id },
        data: {
          claveMercadoPago: encryptedAccessToken,
          mercadoPagoRefreshToken: encryptedRefreshToken,
          tokenMercadoPagoExpiresAt: credentials.expires_in
            ? new Date(Date.now() + credentials.expires_in * 1000)
            : null,
        },
      }),
      prisma.auditLog.create({
        data: {
          action: "MERCADOPAGO_CONNECTION",
          entityType: "ADMINISTRADOR",
          entityId: session.user.id,
          details: `Token de Mercado Pago actualizado. Expiración: ${
            credentials.expires_in
              ? new Date(
                  Date.now() + credentials.expires_in * 1000
                ).toISOString()
              : "No especificada"
          }`,
          ipAddress: ipAddress?.substring(0, 45), // Asegurar longitud máxima
          userAgent: userAgent?.substring(0, 512),
          administradorId: session.user.id,
        },
      }),
    ]);

    // 7. Redirección con parámetros
    const successParams = new URLSearchParams({
      status: "success",
      timestamp: Date.now().toString(),
      userId: session.user.id,
      logId: auditLog.id, // Opcional: incluir ID del log para seguimiento
    });

    return NextResponse.redirect(
      `${process.env.APP_URL!}/market/success?${successParams.toString()}`
    );
  } catch (error) {
    console.error("Error en conexión con Mercado Pago:", error);

    const session = await auth();

    // Crear log de error si hay sesión
    if (session?.user) {
      await prisma.auditLog.create({
        data: {
          action: "MERCADOPAGO_CONNECTION_FAILED",
          entityType: "SYSTEM",
          entityId: "N/A",
          details: `Error: ${(error as Error).message}`,
          ipAddress: request.headers.get("x-forwarded-for")?.substring(0, 45),
          userAgent: request.headers.get("user-agent")?.substring(0, 512),
          administradorId: session.user?.id,
        },
      });
    }

    const errorParams = new URLSearchParams({
      status: "error",
      code:
        (error as Error).name === "Error"
          ? "GENERIC_ERROR"
          : (error as Error).name,
      message: encodeURIComponent((error as Error).message),
    });

    return NextResponse.redirect(
      `${process.env.APP_URL!}/dashboard/integrations?${errorParams.toString()}`
    );
  }
}
