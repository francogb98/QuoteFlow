"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Menu } from "lucide-react";
import Link from "next/link";
import { UserSearchModal } from "./ui/user-search-modal";
import { useSidebarStore } from "@/lib/store/useSideBarStore";
import { NotificationsDropdown } from "./notificaciones-dropdown";

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
    };
    usuarios?: User[];
    notificacionesRecibidas?: any[];
  };
  onNotificationsUpdate?: () => void;
}

export function Header({ user, onNotificationsUpdate }: HeaderProps) {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const toggleSidebar = useSidebarStore((state) => state.toggle);

  const companyName = user?.empresa?.nombre || "Mi Empresa";
  const notificaciones = user?.notificacionesRecibidas || [];
  const users = user?.usuarios || [];

  return (
    <>
      <header
        className="border-b h-14 flex items-center bg-white border-gray-200 sticky top-0 z-40"
        data-tour="header"
      >
        <div className="container mx-auto px-2 sm:px-14 py-4">
          <div className="flex items-center justify-between">
            {/* BOTÓN HAMBURGUESA SOLO EN MOBILE */}
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
              <Button
                variant="outline"
                size="sm"
                data-tour="search"
                className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-800 hover:border-gray-300 bg-transparent"
                onClick={() => setIsSearchModalOpen(true)}
              >
                <Search className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Buscar usuario</span>
              </Button>

              <NotificationsDropdown
                notificaciones={notificaciones}
                onUpdate={onNotificationsUpdate || (() => {})}
              />
            </div>
          </div>
        </div>
      </header>

      <UserSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        users={users}
      />
    </>
  );
}
