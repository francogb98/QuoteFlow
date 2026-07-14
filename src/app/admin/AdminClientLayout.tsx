"use client";

import type React from "react";
import { Toaster } from "sonner";
import { Header } from "@/components/admin/Header";
import { SidebarSimple } from "@/components/admin/prueba/SideBarPrueba";
import { useSidebarStore } from "@/lib/store/useSideBarStore";
import { AdminPanelManager } from "@/components/admin/prueba/AdminPanelManager";
import { OnboardingWizard } from "@/components/admin/onboarding/OnboardingWizard";

interface Props {
  children: React.ReactNode;
  user: any;
}

export default function AdminClientLayout({ children, user }: Props) {
  const isOpen = useSidebarStore((state) => state.isOpen);

  return (
    <div className="h-screen overflow-hidden bg-linear-to-br from-purple-50 via-white to-emerald-50">
      <SidebarSimple user={user} />

      <div
        className={`flex h-full min-h-0 flex-col transition-all duration-300
        ${isOpen ? "md:pl-64" : "md:pl-20"}`}
      >
        <Header user={user} />

        <main className="min-h-0 flex-1 overflow-y-auto px-2 py-4 sm:px-10">
          {children}
        </main>
      </div>

      {/* Manager de paneles globales */}
      <AdminPanelManager user={user} />

      {/* Onboarding wizard for new users */}
      <OnboardingWizard />

      <Toaster position="top-right" richColors />
    </div>
  );
}
