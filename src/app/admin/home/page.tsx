import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Bienvenida from "./Bienvenida";

import type { Metadata } from "next";
import AdminStats from "./AdminStats";

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
      <Bienvenida user={user} link={url} />
      <AdminStats />
    </>
  );
}
