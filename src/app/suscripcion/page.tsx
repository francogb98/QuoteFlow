import { auth } from "@/*";
import SuscripcionView from "@/01-components/admin/subscription/SuscripcionView";
import { isSuperAdminRole } from "@/lib/auth/isSuperAdmin";
import { tieneAccesoEmpresa } from "@/lib/auth/tieneAcceso";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  // SUPER_ADMIN has unconditional access — redirect them away from this page
  if (isSuperAdminRole(session.user.rol)) {
    redirect("/admin");
  }

  //@ts-ignore
  const resultado = tieneAccesoEmpresa(session.user.empresa.suscripcion);

  if (resultado.tieneAcceso) {
    redirect("/admin");
  }

  return <SuscripcionView />;
}
