import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PruebaTour from "./PruebaTour";

import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Panel de Administración`,
    description: "Panel de administración",
  };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const user = session.user;

  const url = process.env.FRONTEND_URL!;

  if (!url) {
    throw new Error("Error en el servidor: URL no encontrada.");
  }

  return (
    <>
      <PruebaTour user={user} link={url} />
    </>
  );
}
