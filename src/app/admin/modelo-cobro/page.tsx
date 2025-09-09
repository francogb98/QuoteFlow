import { auth } from "@/*";
import { ModeloCobro } from "@/01-components/admin/modelo-cobro/ModeloCobro";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Modelo de Cobro",
};

export const revalidate = 0;

export default async function NamePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }
  const user = session.user;

  return (
    <div className="flex flex-col gap-5 px-10">
      <ModeloCobro usuario={user} />
    </div>
  );
}
