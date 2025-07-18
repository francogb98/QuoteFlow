import { MercadoPagoConfig, Preference, OAuth } from "mercadopago";

const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

const api = {
  user: {
    async authorize() {
      // Obtenemos la url de autorización
      const url = new OAuth(mercadopago).getAuthorizationURL({
        options: {
          client_id: process.env.NEXT_PUBLIC_MP_CLIENT_ID,
          redirect_uri: `${process.env.APP_URL}api/mercadopago/connect`,
        },
      });

      // Devolvemos la url
      return url;
    },
    async connect(code: string) {
      const credentials = await new OAuth(mercadopago).create({
        body: {
          client_id: process.env.NEXT_PUBLIC_MP_CLIENT_ID,
          client_secret: process.env.MP_CLIENT_SECRET,
          code,
          redirect_uri: `${process.env.APP_URL}api/mercadopago/connect`,
        },
      });
      console.log(credentials);
      // Devolvemos las credenciales
      return credentials;
    },

    async submit(marketplace: string) {
      // Creamos el cliente de Mercado Pago usando el access token del Marketplace
      const client: MercadoPagoConfig = new MercadoPagoConfig({
        accessToken: marketplace,
      });

      // Creamos la preferencia incluyendo el precio, titulo y metadata. La información de `items` es standard de Mercado Pago. La información que nosotros necesitamos para nuestra DB debería vivir en `metadata`.
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
          // Le agregamos ARS 5 de comisión
          marketplace_fee: 5,
        },
      });

      // Devolvemos el init point (url de pago) para que el usuario pueda pagar
      return preference.init_point!;
    },
  },
};

export default api;
