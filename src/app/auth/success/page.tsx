import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { successSuscriber } from "@/actions";

//traer estos datos de los params ?preapproval_created=true&empresaId=65c3c5c3-701d-46d4-a586-df8ccaf198c1&planType=PRO&frequency=MENSUAL&preapproval_id=2dfd310526154e9bb720b220a3a5bb17

interface Props {
  searchParams: Promise<{
    preapproval_created: string;
    empresaId: string;
    planType: string;
    frequency: string;
    preapproval_id: string;
  }>;
}

export default async function RegistrationSuccessPage({ searchParams }: Props) {
  // Desestructurar los parámetros
  const {
    preapproval_created,
    empresaId,
    planType,
    frequency,
    preapproval_id,
  } = await searchParams;

  const resp = await successSuscriber({
    preapproval_created,
    empresaId,
    planType,
    frequency,
    preapproval_id,
  });

  return (
    <div className="w-full max-w-md mx-auto py-12">
      <div className="bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl p-8 border border-green-100 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
          ¡Registro y Pago Exitoso!
        </h1>
        <p className="text-gray-700 mb-6">
          Tu cuenta ha sido creada y tu suscripción activada.
          <br />
          Ya puedes iniciar sesión para comenzar a gestionar tu gimnasio.
        </p>
        <Button
          asChild
          className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Link href="/auth/login">Ir a Iniciar Sesión</Link>
        </Button>
      </div>
    </div>
  );
}
