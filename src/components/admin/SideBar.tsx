"use client";

import type React from "react";
import { logout } from "@/actions/auth/logout";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
  Store,
  Menu,
  X,
  CreditCard,
} from "lucide-react";

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  subItems?: NavItem[];
}

const navItems: NavItem[] = [
  { href: "/admin/home", icon: <Home size={20} />, label: "Home" },
  { href: "/admin/users/list", icon: <Users size={20} />, label: "Usuarios" },
  {
    href: "/admin/settings",
    icon: <Settings size={20} />,
    label: "Configuracion",
  },
  {
    href: "/admin/market",
    icon: <CreditCard size={20} />,
    label: "Conexión Mercado Pago",
  },
];

export const Sidebar = ({ user }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAccountExpanded, setIsAccountExpanded] = useState(false); // Estado para expandir/colapsar "Cuenta"

  const pathname = usePathname();

  const handleClickLogout = async () => {
    try {
      const resp = await logout();
      if (resp.ok) {
        window.location.href = "/auth/login";
      }
    } catch (error) {
      console.log(error);
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-white/80 backdrop-blur-md border-b border-purple-100 fixed w-full z-10 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <button
            className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            onClick={toggleSidebar}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed top-0 left-0 h-screen w-screen bg-black/50 z-20 backdrop-blur-sm"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:relative
          bg-white/90 backdrop-blur-md h-screen
          border-r border-purple-100
          z-30
          transition-all duration-300 ease-in-out
          shadow-xl md:shadow-none
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isCollapsed ? "w-20" : "w-64"}
        `}
      >
        {/* Botón para colapsar/expandir (solo desktop) */}
        <button
          className="absolute -right-3 top-6 hidden md:flex items-center justify-center
                     bg-white/90 backdrop-blur-sm rounded-full border border-purple-200 w-7 h-7
                     shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110
                     hover:bg-gradient-to-r hover:from-purple-500 hover:to-violet-600 hover:text-white hover:border-transparent"
          onClick={toggleCollapse}
          aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Contenido del Sidebar */}
        <div className="h-full flex flex-col overflow-hidden">
          {/* Logo/Header */}
          <div className="p-6 border-b border-purple-100">
            <div className="flex items-center justify-between">
              {!isCollapsed ? (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Store className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                      Admin Panel
                    </h2>
                    <p className="text-xs text-purple-500">Panel de Control</p>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center w-full">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Store className="w-6 h-6 text-white" />
                  </div>
                </div>
              )}
              <button
                className="flex md:hidden text-purple-600 hover:text-purple-800"
                onClick={toggleSidebar}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Menú de navegación */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const isAccountItem = item.label === "Cuenta";
                return (
                  <li key={item.href}>
                    {isAccountItem ? (
                      <>
                        <button
                          className={`
                            flex items-center p-3 rounded-xl transition-all duration-300 w-full
                            ${
                              isAccountExpanded || isActive
                                ? "bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg transform scale-105"
                                : "text-purple-600 hover:bg-purple-50 hover:text-purple-700 hover:shadow-md hover:scale-102"
                            }
                            ${isCollapsed ? "justify-center" : ""}
                          `}
                          onClick={() =>
                            setIsAccountExpanded(!isAccountExpanded)
                          }
                          aria-expanded={isAccountExpanded}
                        >
                          <span
                            className={`${isCollapsed ? "mr-0" : "mr-3"} ${
                              isAccountExpanded || isActive ? "text-white" : ""
                            }`}
                          >
                            {item.icon}
                          </span>
                          <span
                            className={`${
                              isCollapsed ? "hidden" : "block"
                            } font-medium`}
                          >
                            {item.label}
                          </span>
                          {!isCollapsed && (
                            <ChevronRight
                              size={16}
                              className={`ml-auto transition-transform duration-200 ${
                                isAccountExpanded ? "rotate-90" : ""
                              }`}
                            />
                          )}
                        </button>
                      </>
                    ) : (
                      <Link
                        href={item.href}
                        className={`
                          flex items-center p-3 rounded-xl transition-all duration-300
                          ${
                            isActive
                              ? "bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg transform scale-105"
                              : "text-purple-600 hover:bg-purple-50 hover:text-purple-700 hover:shadow-md hover:scale-102"
                          }
                          ${isCollapsed ? "justify-center" : ""}
                        `}
                        onClick={() => setIsOpen(false)}
                      >
                        <span
                          className={`${isCollapsed ? "mr-0" : "mr-3"} ${
                            isActive ? "text-white" : ""
                          }`}
                        >
                          {item.icon}
                        </span>
                        <span
                          className={`${
                            isCollapsed ? "hidden" : "block"
                          } font-medium`}
                        >
                          {item.label}
                        </span>
                        {isActive && !isCollapsed && (
                          <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </Link>
                    )}
                  </li>
                );
              })}
              <li>
                <button
                  className={`
                    flex items-center p-3 rounded-xl transition-all duration-300
                    text-red-600 hover:bg-red-50 hover:text-red-700 hover:shadow-md hover:scale-102 border border-transparent hover:border-red-200
                    ${isCollapsed ? "justify-center" : ""}
                  `}
                  onClick={handleClickLogout}
                >
                  <LogOut
                    className={`${isCollapsed ? "mr-0" : "mr-3"}`}
                    size={20}
                  />
                  <span
                    className={`${
                      isCollapsed ? "hidden" : "block"
                    } font-medium`}
                  >
                    Cerrar Sesión
                  </span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};
