import { decrypt } from "../crypto";
import prisma from "../prisma";

export async function getValidMercadoPagoToken(adminId: string) {
  const admin = await prisma.administrador.findUnique({
    where: { id: adminId },
    select: {
      claveMercadoPago: true,
      mercadoPagoRefreshToken: true,
      tokenMercadoPagoExpiresAt: true,
    },
  });

  // Si el token aún es válido
  if (
    admin?.tokenMercadoPagoExpiresAt &&
    new Date(admin.tokenMercadoPagoExpiresAt) > new Date()
  ) {
    return decrypt(admin.claveMercadoPago!);
  }

  // Renovación con refresh token
  if (admin?.mercadoPagoRefreshToken) {
    const newCredentials = await renewToken(admin.mercadoPagoRefreshToken);

    await prisma.administrador.update({
      where: { id: adminId },
      data: {
        claveMercadoPago: newCredentials.access_token,
        mercadoPagoRefreshToken:
          newCredentials.refresh_token || admin.mercadoPagoRefreshToken,
        tokenMercadoPagoExpiresAt: new Date(
          Date.now() + newCredentials.expires_in * 1000
        ),
      },
    });

    return newCredentials.access_token;
  }

  throw new Error("No hay credenciales válidas de Mercado Pago");
}

async function renewToken(refreshToken: string) {
  const CLIENT_SECRET = process.env.MP_CLIENT_SECRET;
  const CLIENT_ID = process.env.NEXT_PUBLIC_MP_CLIENT_ID;

  const response = await fetch("https://api.mercadopago.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${CLIENT_ID}:${CLIENT_SECRET}`
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) throw new Error("Error renovando token");

  return await response.json();
}
