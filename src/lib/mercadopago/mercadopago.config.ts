import MercadoPagoConfig from "mercadopago";

export const config = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN_CHEKCKOUT!,
});
