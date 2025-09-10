// UsersListPage.tsx
import { auth } from "@/auth.config";
import { redirect } from "next/navigation";

import { ModalCreateUser, NotAllowed } from "@/01-components/admin";
import { UserDashboardWrapper } from "@/01-components/admin/users/list/UsersDashboardWrapper";

import type { Metadata } from "next";

export const revalidate = 0;

interface Props {
  searchParams: Promise<{
    profesorId?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { profesorId } = (await searchParams) || null;
  return {
    title: `Usuarios - ${profesorId ? `Profesor` : "Administrador "}`,
    description: "Listado de usuarios",
  };
}

export default async function UsersListPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const { user } = session;
  const { profesorId } = (await searchParams) || null; // Leer el ID del profesor de los searchParams

  const missingTariff = !user.configuracionTarifa;
  const missingMercadoPago =
    user.modeloDeCobro === "MERCADOPAGO" && !user.claveMercadoPago;
  const hasRequiredConfig = !missingTariff && !missingMercadoPago;

  const tarifasDisponibles =
    user.configuracionTarifa?.tipoConfiguracion === "FIJA_MENSUAL"
      ? user.configuracionTarifa.rangos
      : //@ts-ignore
        user.configuracionTarifa?.dinamicas || [];

  const isDynamicTariff =
    user.configuracionTarifa?.tipoConfiguracion ===
    "DINAMICA_POR_FECHA_INGRESO";

  return (
    <div className="flex flex-col gap-5 pb-8">
      {!hasRequiredConfig ? (
        <NotAllowed
          missingTariff={missingTariff}
          missingMercadoPago={missingMercadoPago}
        />
      ) : (
        // Renderizar el modal solo si es el administrador principal y no hay un profesorId
        !profesorId && (
          //@ts-ignore
          <ModalCreateUser
            administradorId={user.id}
            tarifasDisponibles={tarifasDisponibles}
            isDynamicTariff={isDynamicTariff}
          />
        )
      )}
      <UserDashboardWrapper profesorId={profesorId} session={session} />
    </div>
  );
}
