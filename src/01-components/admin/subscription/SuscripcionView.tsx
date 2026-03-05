// app/components/subscription/SuscripcionView.tsx

import prisma from "@/lib/prisma";
import { auth } from "@/*";
import { redirect } from "next/navigation";
import SubscriptionCard from "./SubscripcionCard";
import PlanSelector from "./PlanSelector";
import LogoutButton from "./LogoutButton";

interface Props {
  fromAdmin?: boolean;
}

export default async function SuscripcionView({ fromAdmin }: Props) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const empresa = await prisma.empresa.findUnique({
    where: { id: session.user.empresaId },
    include: { suscripcion: true },
  });

  if (!empresa) {
    redirect("/");
  }

  console.log({ empresa });

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            {fromAdmin ? "Gestión de Suscripción" : "Tu Suscripción"}
          </h1>
          <LogoutButton />
        </div>

        {empresa.suscripcion ? (
          <SubscriptionCard suscripcion={empresa.suscripcion} />
        ) : (
          <div className="bg-yellow-50 border border-yellow-300 p-6 rounded-xl">
            <p className="font-medium text-yellow-800">
              No tenés una suscripción activa.
            </p>
          </div>
        )}

        <PlanSelector
          planActual={empresa.suscripcion?.planTipo ?? ""}
          frecuenciaActual={empresa.suscripcion?.frecuenciaPago ?? ""}
        />
      </div>
    </div>
  );
}
