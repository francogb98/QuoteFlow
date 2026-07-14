"use client";

import { useState } from "react";
import { Search, Menu, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserSearchModal } from "./ui/user-search-modal";
import { useSidebarStore } from "@/lib/store/useSideBarStore";
import { useAdminPanelStore } from "@/lib/store/useAdminPanelStore";
import { NotificationsDropdown } from "./notificaciones-dropdown";
import { SubscriptionStatusBanner } from "../nuevo/subscription-status-banner";
import { NewUserDialog } from "../nuevo/new-user-dialog";

export function Header({ user, onNotificationsUpdate }: any) {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isNewUserOpen, setIsNewUserOpen] = useState(false);

  const openUser = useAdminPanelStore((s) => s.openUser);
  const toggleSidebar = useSidebarStore((state) => state.toggle);

  const companyName = user?.empresa?.nombre || "Mi Empresa";
  const notificaciones = user?.notificacionesRecibidas || [];
  const users = user?.usuarios || [];
  const suscripcion = user?.empresa?.suscripcion;

  return (
    <>
      <header
        className="border-b h-14 flex items-center bg-background border-border sticky top-0 z-40"
        data-tour="header"
      >
        <div className="container mx-auto px-2 sm:px-14 py-4">
          <div className="flex items-center justify-between">
            {/* BOTÓN HAMBURGUESA */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted transition"
              onClick={toggleSidebar}
              aria-label="Abrir menú lateral"
            >
              <Menu className="w-6 h-6 text-foreground" />
            </button>

            <div className="flex items-center gap-4">
              <Link href={`/admin/home`}>
                <h1 className="text-xl font-semibold capitalize text-primary hover:opacity-80 transition-opacity">
                  {companyName}
                </h1>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSearchModalOpen(true)}
                className="gap-2"
                data-tour="search"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Buscar usuario</span>
              </Button>

              <NotificationsDropdown
                notificaciones={notificaciones}
                onUpdate={onNotificationsUpdate || (() => {})}
              />

              <Button
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => setIsNewUserOpen(true)}
              >
                <Plus className="size-3.5" />
                <span className="hidden sm:inline">Nuevo Usuario</span>
              </Button>
            </div>
          </div>
        </div>

        <NewUserDialog
          open={isNewUserOpen}
          onOpenChange={setIsNewUserOpen}
          empresaId={user?.empresa?.id}
          configuracionTarifa={user?.configuracionTarifa}
        />
      </header>

      {user?.rol !== "SUPER_ADMIN" && (
        <SubscriptionStatusBanner suscripcion={suscripcion} />
      )}

      <UserSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        users={users}
        onUserSelect={(id) => {
          setIsSearchModalOpen(false);
          openUser(id);
        }}
      />
    </>
  );
}
