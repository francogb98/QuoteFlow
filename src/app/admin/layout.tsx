import type React from "react";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";

import { auth } from "@/*";
import { Header } from "@/01-components/admin/Header";
import { Suspense } from "react";

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
    // <div className="flex h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-100 gap-4">
    //   <Sidebar user={session.user} />
    //   <div className="flex-1 flex flex-col overflow-hidden mt-[4.5rem] sm:mt-0">
    //     <main className="flex-1 overflow-y-auto md:p-8">
    //       <div className="max-w-7xl mx-auto">{children}</div>
    //     </main>
    //     <Toaster position="top-right" richColors />
    //   </div>
    // </div>

    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50">
      <Suspense fallback={<div>Loading...</div>}>
        <Header user={session.user} />
        <main className="container mx-auto px-2 sm:px-10 py-2">{children}</main>
      </Suspense>
      <Toaster position="top-right" richColors />
    </div>
  );
}
