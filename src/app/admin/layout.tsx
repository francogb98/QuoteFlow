// app/admin/layout.tsx
import type React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/*";
import AdminClientLayout from "./AdminClientLayout";
import { AppStoreInitializer } from "@/components/AppStoreInitializer";
import prisma from "@/lib/prisma";
// import { tieneAcceso } from "@/lib/subscriptions/subscriptions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const empresa = await prisma.empresa.findUnique({
    where: { id: session.user.empresaId },
    include: { suscripcion: true },
  });

  // if (!empresa || !tieneAcceso(empresa.suscripcion)) {
  //   redirect("/suscripcion");
  // }

  return (
    <AdminClientLayout user={session.user}>
      <AppStoreInitializer />
      {children}
    </AdminClientLayout>
  );
}
