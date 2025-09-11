import type React from "react";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";

import { auth } from "@/*";
import { Header } from "@/01-components/admin/Header";
import { Footer } from "@/01-components/admin/Footer";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50">
      <Header user={session.user} />{" "}
      <main className="flex-1 container mx-auto px-2 sm:px-10 py-2 overflow-y-auto max-w-full pb-16">
        {children}
      </main>
      <Footer />
      <Toaster position="top-right" richColors />{" "}
    </div>
  );
}
