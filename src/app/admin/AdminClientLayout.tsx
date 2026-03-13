"use client";

import type React from "react";
import { Toaster } from "sonner";
import { Header } from "@/01-components/admin/Header";
import { SidebarSimple } from "@/01-components/admin/prueba/SideBarPrueba";
import { useSidebarStore } from "@/lib/store/useSideBarStore";
import { AdminPanelManager } from "@/01-components/admin/prueba/AdminPanelManager";

interface Props {
  children: React.ReactNode;
  user: any;
}

export default function AdminClientLayout({ children, user }: Props) {
  const isOpen = useSidebarStore((state) => state.isOpen);

  return (
    <div className="h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50 overflow-hidden">
      <SidebarSimple user={user} />

      <div
        className={`flex flex-col min-h-screen transition-all duration-300
        ${isOpen ? "md:pl-64" : "md:pl-20"}`}
      >
        <Header user={user} />

        <main className="flex-1 overflow-y-auto px-2 sm:px-10 py-4">
          {children}
        </main>
      </div>

      {/* Manager de paneles globales */}
      <AdminPanelManager user={user} />

      <Toaster position="top-right" richColors />
    </div>
  );
}
