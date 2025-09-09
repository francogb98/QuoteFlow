import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { getUser } from "@/actions/users";

import { FormEditUser } from "./ui/FormEditUser";
import { auth } from "@/*";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const user = await getUser(resolvedParams.id);
  return {
    title: `Usuario | ${user.nombre} ${user.apellido}`,
    description: `Información del usuario ${user.nombre} ${user.apellido}`,
  };
}

export default async function NamePage({ params }: Props) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  if (!id) {
    redirect("/users/list");
  }

  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  const tarifasDisponibles =
    session.user.configuracionTarifa?.tipoConfiguracion === "FIJA_MENSUAL"
      ? session.user.configuracionTarifa.rangos
      : //@ts-ignore
        session.user.configuracionTarifa.dinamicas;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50 p-4 md:p-6">
      <div className="md:px-10">
        {id && (
          <div className="space-y-6">
            <FormEditUser id={id} tarifasDisponibles={tarifasDisponibles} />
          </div>
        )}
      </div>
    </div>
  );
}
