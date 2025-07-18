import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, CreditCard } from "lucide-react";
import { handleSuscriber } from "@/actions";
import { plans, type PlanOption } from "@/lib";

interface PaymentPageProps {
  params: Promise<{
    tempRegistrationId: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function RegisterPaymentPage({
  params,
}: PaymentPageProps) {
  const { tempRegistrationId } = await params;

  if (!tempRegistrationId) {
    notFound();
  }

  const tempRegistration = await prisma.tempRegistration.findUnique({
    where: { id: tempRegistrationId },
  });

  if (!tempRegistration) {
    notFound();
  }

  const selectedPlanId =
    `${tempRegistration.planTipo.toLowerCase()}_${tempRegistration.frecuenciaPago.toLowerCase()}` as PlanOption["id"];
  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  if (!selectedPlan) {
    console.error(
      "Plan no encontrado para el registro temporal:",
      selectedPlanId
    );
    notFound();
  }

  const transactionAmount = Number.parseFloat(
    selectedPlan.price.replace(/\$|\./g, "").replace(",", ".")
  );

  const initiatePayment = async () => {
    "use server";
    if (transactionAmount === undefined || isNaN(transactionAmount)) {
      return { error: "Monto de transacción inválido." };
    }

    const suscriberResponse = await handleSuscriber({
      empresaId: tempRegistration.id,
      adminEmail: tempRegistration.email, // NUEVO: Pasar el email del registro temporal
      transactionAmount: transactionAmount,
      planName: selectedPlan.name,
      frecuenciaPago: tempRegistration.frecuenciaPago,
      planTipo: tempRegistration.planTipo,
    });

    if (suscriberResponse.redirectUrl) {
      // Redirigir al usuario a Mercado Pago
      redirect(suscriberResponse.redirectUrl);
      return { redirectUrl: suscriberResponse.redirectUrl };
    } else {
      return { error: suscriberResponse.error || "Error al iniciar el pago." };
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-8">
      <Card className="bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl p-6 md:p-8 border border-purple-100">
        <CardHeader className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mb-2">
            Confirmar Suscripción
          </CardTitle>
          <p className="text-gray-600">
            Revisa los detalles de tu plan antes de proceder al pago.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <div>
              <p className="font-semibold">Empresa:</p>
              <p>{tempRegistration.nombreEmpresa}</p>
            </div>
            <div>
              <p className="font-semibold">Administrador:</p>
              <p>{tempRegistration.nombre}</p>
            </div>
            <div>
              <p className="font-semibold">DNI:</p>
              <p>{tempRegistration.documento}</p>
            </div>
            <div>
              <p className="font-semibold">Email:</p>
              <p>{tempRegistration.email}</p> {/* NUEVO: Mostrar el email */}
            </div>
            <div>
              <p className="font-semibold">Teléfono:</p>
              <p>{tempRegistration.telefono}</p>
            </div>
          </div>

          <div className="border-t border-purple-200 pt-6 space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <CheckCircle className="w-5 h-5 text-emerald-500 mr-2" />
              Detalles del Plan
            </h3>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
              <p className="text-lg font-semibold text-gray-900">
                {selectedPlan.name}
              </p>
              <p className="text-2xl font-bold text-purple-700 my-2">
                {selectedPlan.price}{" "}
                <span className="text-base text-gray-600">
                  {selectedPlan.period}
                </span>
              </p>
              {selectedPlan.originalPrice && (
                <p className="text-sm text-gray-500 line-through">
                  Precio original: {selectedPlan.originalPrice}
                </p>
              )}
              <ul className="mt-3 space-y-1 text-sm text-gray-600">
                {selectedPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-purple-200 pt-6 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Al hacer clic en "Pagar con Mercado Pago", serás redirigido a la
              plataforma de Mercado Pago para completar tu suscripción.
            </p>
            {/* @ts-ignore */}
            <form action={initiatePayment}>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] text-lg"
              >
                Pagar con Mercado Pago
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
