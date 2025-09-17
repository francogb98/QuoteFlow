"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Search } from "lucide-react";
import Link from "next/link";
import { UserSearchModal } from "./ui/user-search-modal";

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
    notificacionesRecibidas?: any;
  };
}

export function Header({ user }: HeaderProps) {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const companyName = user?.empresa?.nombre || "Mi Empresa";
  const notificacionesNoLeidas = user?.notificacionesRecibidas.length || 0;
  const users = user?.usuarios || [];

  return (
    <>
      <header className="border-b bg-card" data-tour="header">
        <div className="container mx-auto px-2 sm:px-14 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/admin/home`}>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-purple-600 bg-clip-text text-transparent capitalize">
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
              <Link href="/admin/notificaciones">
                <div className="relative" data-tour="notifications">
                  <Bell className="w-6 h-6 text-black-600 hover:text-black-700 transition-colors" />
                  {notificacionesNoLeidas > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-gradient-to-r from-red-500 to-red-600 text-white">
                      {notificacionesNoLeidas}
                    </Badge>
                  )}
                </div>
              </Link>
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
