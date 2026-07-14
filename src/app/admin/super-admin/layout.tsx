import type React from "react";
import { redirect } from "next/navigation";
import { getSuperAdminAccess } from "@/lib/auth/require-super-admin";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await getSuperAdminAccess();

  if (!access.ok) {
    redirect(access.status === 401 ? "/auth/login" : "/admin/home");
  }

  return children;
}
