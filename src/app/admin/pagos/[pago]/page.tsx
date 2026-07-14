import { getPagoUser } from "@/actions/admin/pago/getPagoUser";
import { PagosCard } from "@/components/admin/pagos/PagosCard";

interface NamePageProps {
  params: Promise<{
    pago: string;
  }>;
}

export default async function NamePage({ params }: NamePageProps) {
  const { pago } = await params;

  const pagoData = await getPagoUser(pago);

  if (!pagoData.ok) {
    return (
      <div>
        <h1>Pago no encontrado</h1>
      </div>
    );
  }

  return (
    <div className="p-8 h-100 w-100 mx-auto">
      <PagosCard
        pago={pagoData.pago!}
        userName={pagoData.pago!.usuario.nombre!}
      />
    </div>
  );
}
