import { findEmpresa } from "@/actions/users/public/findEmpresa";
import { FormSearchUser } from "./ui/FormSearchUser";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{
    empresa: string;
  }>;
}

// Genera la metadata para la página de la empresa
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { empresa } = await params;

  const admin = await findEmpresa(empresa);

  if (!admin) {
    return {};
  }

  // Genera las URLs completas de los íconos si lo necesitas

  return {
    title: `Consulta de Pagos | ${empresa}`,
    description: `Consulta el estado de tus pagos y obligaciones pendientes para ${empresa}.`,
    metadataBase: new URL("https://www.cuotafacil.com.ar"),
    openGraph: {
      title: `Consulta de Pagos | ${empresa}`,
      description: `Consulta el estado de tus pagos y obligaciones pendientes para ${empresa}.`,
      url: `https://www.cuotafacil.com.ar/d/${empresa}`, // URL de la página específica
      siteName: "CuotaFacil",
      locale: "es_AR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Consulta de Pagos | ${empresa}`,
      description: `Consulta el estado de tus pagos y obligaciones pendientes para ${empresa}.`,
    },
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
        <div className="text-center mb-12">
          <div className="relative">
            <div className="flex items-center justify-center mb-6">
              <div className="h-1 w-20 bg-gradient-to-r from-green-400 to-violet-500 rounded-full"></div>
              <span className="mx-4 text-2xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-violet-600 bg-clip-text text-transparent capitalize pb-2">
                {empresa}
              </span>
              <div className="h-1 w-20 bg-gradient-to-r from-violet-500 to-green-400 rounded-full"></div>
            </div>
          </div>
          <p className="hidden md:block text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Ingresa tu número de DNI para consultar el estado de tus pagos y
            obligaciones pendientes
          </p>
        </div>
        <FormSearchUser empresa={empresa} />
      </div>
    </div>
  );
}
