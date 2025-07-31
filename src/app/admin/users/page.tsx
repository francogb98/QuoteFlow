import { auth } from "@/auth.config";
import { redirect } from "next/navigation";

import { getTariffConfigurationInfo } from "@/actions/admin/users/create.action";
import {
  ModalCreateUser,
  NotAllowed,
  UserDashboard,
} from "@/01-components/admin";

export default async function UsersListPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const { user } = session;

  // Obtener información de configuración de tarifas
  const tariffInfo = await getTariffConfigurationInfo(user.id);

  const missingTariff = !user.configuracionTarifa;
  const missingMercadoPago = !user.claveMercadoPago;
  const hasRequiredConfig = !missingTariff && !missingMercadoPago;

  return (
    <div className="flex flex-col gap-5">
      {!hasRequiredConfig ? (
        <NotAllowed
          missingTariff={missingTariff}
          missingMercadoPago={missingMercadoPago}
        />
      ) : (
        //@ts-ignore
        <ModalCreateUser administradorId={user.id} tariffInfo={tariffInfo} />
      )}
      {session.user?.id && <UserDashboard />}
    </div>
  );
}
