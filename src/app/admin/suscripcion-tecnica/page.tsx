import { auth } from "@/auth.config";
import { redirect } from "next/navigation";
import { getAllCompaniesWithSubscriptions } from "@/actions/admin/suscripcion-tecnica.action";
import SuscripcionTecnicaPanel from "@/components/admin/suscripcion-tecnica/SuscripcionTecnicaPanel";

export const revalidate = 0;

export default async function SuscripcionTecnicaPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  // Obtener todas las empresas con suscripciones
  const result = await getAllCompaniesWithSubscriptions();

  if (!result.success || !result.data) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Panel Técnico de Suscripciones
        </h1>
        <p className="text-red-600">Error al cargar las suscripciones</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <SuscripcionTecnicaPanel empresas={result.data} />
    </div>
  );
}
