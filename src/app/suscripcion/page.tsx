import { auth } from "@/*";
import SuscripcionView from "@/01-components/admin/subscription/SuscripcionView";
import { tieneAccesoEmpresa } from "@/lib/auth/tieneAcceso";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }
  //@ts-ignore
  const resultado = tieneAccesoEmpresa(session.user.empresa.suscripcion);

  if (resultado.tieneAcceso) {
    redirect("/admin");
  }

  return <SuscripcionView />;
}
