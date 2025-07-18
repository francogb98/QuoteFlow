import { findEmpresa } from "@/actions/users/public/findEmpresa";
import { FormSearchUser } from "./ui/FormSearchUser";
import { notFound } from "next/navigation";
import type { Metadata } from "next"; // Importa Metadata

interface Props {
  params: Promise<{
    empresa: string;
  }>;
}

// Genera la metadata para la página de la empresa
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { empresa } = resolvedParams;

  return {
    title: `Consulta de Pagos | ${empresa}`,
    description: `Consulta el estado de tus pagos y obligaciones pendientes para ${empresa}.`,
  };
}

export const dynamic = "force-dynamic";

export default async function DNIPaymentsPage({ params }: Props) {
  const { empresa } = await params;
  const admin = await findEmpresa(empresa);

  if (!admin) notFound();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-100">
      <div className="container mx-auto sm:px-4 py-8">
        {/* Header mejorado */}
        <div className="text-center mb-12">
          <div className="relative">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Consulta de Usuario
            </h1>
            <div className="flex items-center justify-center mb-6">
              <div className="h-1 w-20 bg-gradient-to-r from-purple-400 to-violet-500 rounded-full"></div>
              <span className="mx-4 text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent capitalize">
                {empresa}
              </span>
              <div className="h-1 w-20 bg-gradient-to-r from-violet-500 to-purple-400 rounded-full"></div>
            </div>
          </div>
          <p className="hidden md:block text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Ingresa tu número de DNI para consultar el estado de tus pagos y
            obligaciones pendientes
          </p>
        </div>
        <FormSearchUser empresa={empresa} />
        {/* Los mensajes de error de búsqueda ahora se manejan dentro de FormSearchUser */}
      </div>
    </div>
  );
}
