import { getPayment } from "@/01-actions/payment/getPayment";
import { ComprobanteView } from "./ui/ComprobanteView";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    comprobante: string;
  }>;
}

export default async function ComprobantePage({ params }: Props) {
  const { comprobante } = await params;

  try {
    const paymentData = await getPayment(comprobante);

    if (!paymentData || paymentData.status !== "approved") {
      notFound();
    }

    return <ComprobanteView paymentData={paymentData} />;
  } catch (error) {
    console.error("Error fetching payment:", error);
    notFound();
  }
}
