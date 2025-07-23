import { auth } from "@/*";
import { DatosPersonales, TarifasGrid } from "./ui";
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
      <DatosPersonales
        documento={user.documento}
        empresa={user.empresa.nombre}
        nombre={user.nombre}
      />

      <TarifasGrid />
    </div>
  );
}
