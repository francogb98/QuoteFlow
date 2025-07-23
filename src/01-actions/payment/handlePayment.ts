"use server";
import { getValidMercadoPagoToken } from "@/lib";
import MercadoPagoConfig, { Preference } from "mercadopago";

const url = process.env.FRONTEND_URL!;

export const handlePayment = async (formData: FormData) => {
  try {
    const suscriberMount = formData.get("suscriberMount");
    const mes = formData.get("mes");
    const nombre = formData.get("nombre");
    const documento = formData.get("documento");
    const adminId = formData.get("adminId");

    if (!suscriberMount || !mes || !nombre || !documento || !adminId) return;

    const token = await getValidMercadoPagoToken(adminId as string);

    const config = new MercadoPagoConfig({
      accessToken: token,
    });

    const newSuscriber = await new Preference(config).create({
      body: {
        items: [
          {
            id: "payCuote",
            unit_price: +suscriberMount,
            quantity: 1,
            title: `CUOTA ${String(
              mes
            ).toUpperCase()} |${nombre} - ${documento}`,
          },
        ],
        payment_methods: {
          excluded_payment_types: [
            {
              id: "credit_card",
            },
          ],
        },
        back_urls: {
          success: `${url}/payment/success`,
          failure: `${url}/payment/failure`,
        },

        payer: {
          email: "",
          name: "",
          address: {
            zip_code: "",
            street_name: "",
          },
        },
        metadata: {
          mes,
          nombre,
          documento,
          adminId,
        },
        auto_return: "approved",
      },
    });
    console.dir(newSuscriber, { depth: null });
    return { redirectUrl: newSuscriber.init_point };
  } catch (error) {
    console.log(error);
    throw error;
  }
};
