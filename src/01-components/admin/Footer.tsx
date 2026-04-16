"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, DollarSign, CreditCard, LogOut, Menu } from "lucide-react";
import { signOut } from "@/*";

export const Footer = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const getLinkClasses = (href: string) => {
    const isActive = pathname === href;
    const baseClass =
      "flex flex-col items-center gap-2 px-3 py-2 rounded-md transition-colors hover:bg-gray-100";
    const activeClass = isActive
      ? "text-purple-900 font-bold"
      : "text-gray-700";

    return `${baseClass} ${activeClass}`;
  };

  const logout = () => {
    signOut({ redirectTo: "https://cuotafacil.com.ar" });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md flex justify-around py-2 z-10">
      {/* En pantallas grandes (desktop/tablet) se muestran los links directos */}
      <Link href="/admin/users" className={getLinkClasses("/admin/users")}>
        <Users className="h-5 w-5" />
        <span className="text-xs text-gray-700">Usuarios</span>
      </Link>
      <Link href="/admin/tarifas" className={getLinkClasses("/admin/tarifas")}>
        <DollarSign className="h-5 w-5" />
        <span className="text-xs text-gray-700">Tarifas</span>
      </Link>
      <Link href="/admin/pagos" className={getLinkClasses("/admin/pagos")}>
        <CreditCard className="h-5 w-5" />
        <span className="text-xs text-gray-700">Pagos</span>
      </Link>

      {/* Botón de logout (visible siempre) */}
      <button
        onClick={logout}
        className="flex flex-col items-center p-2 rounded-md hover:bg-gray-100"
      >
        <LogOut className="h-6 w-6 text-gray-700" />
        <span className="text-xs text-gray-700">Salir</span>
      </button>
    </div>
  );
};
