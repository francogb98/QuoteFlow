import { MercadoPagoConfig, Preference, OAuth } from "mercadopago";

const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

const api = {
  user: {
    async authorize() {
      const url = new OAuth(mercadopago).getAuthorizationURL({
        options: {
          client_id: process.env.NEXT_PUBLIC_MP_CLIENT_ID,
          redirect_uri: `${process.env.FRONTEND_URL}/api/mercadopago/connect`,
        },
      });

      return url;
    },
    async connect(code: string) {
      const credentials = await new OAuth(mercadopago).create({
        body: {
          client_id: process.env.NEXT_PUBLIC_MP_CLIENT_ID,
          client_secret: process.env.MP_CLIENT_SECRET,
          code,
          redirect_uri: `${process.env.FRONTEND_URL}/api/mercadopago/connect`,
        },
      });
      return credentials;
    },

    async submit(marketplace: string) {
      const client: MercadoPagoConfig = new MercadoPagoConfig({
        accessToken: marketplace,
      });

      const preference = await new Preference(client).create({
        body: {
          items: [
            {
              id: "message",
              unit_price: 100,
              quantity: 1,
              title: "Mensaje de muro",
            },
          ],
          marketplace_fee: 5,
        },
      });

      return preference.init_point!;
    },
  },
};

export default api;
