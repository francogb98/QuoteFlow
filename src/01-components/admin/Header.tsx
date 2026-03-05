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

// Interfaces (mantenemos la estructura que viene de tu server side props o session)
interface User {
  id: string;
  nombre: string;
  apellido: string;
  documento: string;
  estado: string;
  estaActivo: boolean;
}

interface HeaderProps {
  user?: {
    empresa?: {
      nombre?: string;
      suscripcion?: any; // Aquí viene la info real de Prisma
    };
    usuarios?: User[];
    notificacionesRecibidas?: any[];
  } | null;
  onNotificationsUpdate?: () => void;
}

export function Header({ user, onNotificationsUpdate }: any) {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isNewUserOpen, setIsNewUserOpen] = useState(false);

  // Stores
  const openUser = useAdminPanelStore((s) => s.openUser);
  const toggleSidebar = useSidebarStore((state) => state.toggle);

  // Datos
  const companyName = user?.empresa?.nombre || "Mi Empresa";
  const notificaciones = user?.notificacionesRecibidas || [];
  const users = user?.usuarios || [];

  // Extraemos la suscripción de la empresa
  const suscripcion = user?.empresa?.suscripcion;

  return (
    <>
      <header
        className="border-b h-14 flex items-center bg-white border-gray-200 sticky top-0 z-40"
        data-tour="header"
      >
        <div className="container mx-auto px-2 sm:px-14 py-4">
          <div className="flex items-center justify-between">
            {/* BOTÓN HAMBURGUESA */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
              onClick={toggleSidebar}
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>

            <div className="flex items-center gap-4">
              <Link href={`/admin/home`}>
                <h1 className="text-xl font-semibold capitalize bg-gradient-to-r from-emerald-600 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                  {companyName}
                </h1>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="flex items-center border border-gray-200 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-md text-sm transition-colors"
                data-tour="search"
              >
                <Search className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Buscar usuario</span>
              </button>

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
          // CAMBIO AQUÍ: user?.configuracionTarifa en lugar de user?.empresa?.configuracionTarifa
          configuracionTarifa={user?.configuracionTarifa}
        />
      </header>

      {/* Banner de Suscripción con datos reales */}
      <SubscriptionStatusBanner suscripcion={suscripcion} />

      {/* Dejamos comentado o eliminado el PaymentActionModal por ahora */}
      {/* <PaymentActionModal ... /> */}

      {/* Modal de Búsqueda de Usuario */}
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
