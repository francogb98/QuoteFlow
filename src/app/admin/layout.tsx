import { Sidebar } from "@/components";
import type React from "react";
import { Toaster } from "sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-100 gap-4">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden mt-[4.5rem] sm:mt-0">
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
        <Toaster position="top-right" richColors />
      </div>
    </div>
  );
}
