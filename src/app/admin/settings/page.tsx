import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DatosPersonales } from "./ui/datosAdmin/DatosPersonales";

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
        email={user.email}
      />
    </div>
  );
}
