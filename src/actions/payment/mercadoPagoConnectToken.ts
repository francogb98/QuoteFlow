"use server";
import { MercadoPagoConfig, Preference, OAuth } from "mercadopago";
const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});
export const connectMercadoPago = async () => {
  const url = new OAuth(mercadopago).getAuthorizationURL({
    options: {
      client_id: process.env.NEXT_PUBLIC_MP_CLIENT_ID,
      redirect_uri: `${process.env.FRONTEND_URL}/api/mercadopago/connect`,
    },
  });

  return url;
};
