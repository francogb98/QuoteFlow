// UsersListPage.tsx
import { auth } from "@/auth.config";
import { redirect } from "next/navigation";

import { NotAllowed } from "@/components/admin";
import { UserDashboardWrapper } from "@/components/admin/users/list/UsersDashboardWrapper";

import type { Metadata } from "next";
import { CreateUserButton } from "@/components/admin/users/new/create-user-button";

export const revalidate = 0;

interface Props {
  searchParams:
    | Promise<{
        profesorId?: string;
      }>
    | undefined;
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const params = await searchParams;
  const { profesorId } = params || {};
  return {
    title: `Usuarios - ${profesorId ? `Profesor` : "Administrador "}`,
    description: "Listado de usuarios",
  };
}

export default async function UsersListPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const { user } = session;
  const params = await searchParams;
  const { profesorId } = params || {};

  const missingTariff = !user.configuracionTarifa;
  const missingMercadoPago =
    user.modeloDeCobro === "MERCADOPAGO" && !user.claveMercadoPago;
  const hasRequiredConfig = !missingTariff && !missingMercadoPago;

  const tarifasDisponibles =
    user.configuracionTarifa?.tipoConfiguracion === "FIJA_MENSUAL"
      ? user.configuracionTarifa.rangos
      : (user.configuracionTarifa as unknown as { dinamicas?: unknown[] })?.dinamicas || [];

  const isDynamicTariff =
    user.configuracionTarifa?.tipoConfiguracion ===
    "DINAMICA_POR_FECHA_INGRESO";

  return (
    <div className="flex flex-col pb-8">
      {!hasRequiredConfig ? (
        <NotAllowed
          missingTariff={missingTariff}
          missingMercadoPago={missingMercadoPago}
        />
      ) : (
        !profesorId && (
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gestión de Usuarios
              </h1>
              <p className="text-gray-600 mt-1">
                Administra los usuarios de tu sistema
              </p>
            </div>
          </div>
        )
      )}
      <UserDashboardWrapper profesorId={profesorId} session={session} />
    </div>
  );
}
