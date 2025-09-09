import { auth } from "@/*";
import { TariffManagement } from "@/01-components/admin/tarifas/TariffManagement";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Configuraciones",
};

export const revalidate = 0;

export default async function NamePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }
  const user = session.user;

  return (
    <div className="flex flex-col gap-5">
      <TariffManagement user={user} />
    </div>
  );
}
