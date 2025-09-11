import { auth } from "@/*";
import { TariffManagement } from "@/01-components/admin/tarifas/nueva/tariff-managment";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Tarifas | Configuraciones",
  description: "Configuracion de tarifas y cuotas para el cobro a los alumnos.",
};

export const revalidate = 0;

export default async function NamePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }
  const user = session.user;

  return (
    <>
      {/* @ts-ignore */}
      <TariffManagement user={user} />
    </>
  );
}
