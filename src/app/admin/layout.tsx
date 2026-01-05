// app/admin/layout.tsx
import type React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/*";
import AdminClientLayout from "./AdminClientLayout";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return <AdminClientLayout user={session.user}>{children}</AdminClientLayout>;
}
