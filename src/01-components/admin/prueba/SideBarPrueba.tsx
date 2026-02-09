"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LineChart,
  CreditCard,
  Settings,
  Home,
  DollarSign,
  LogOut,
  Users,
  PersonStanding,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useSidebarStore } from "@/lib/store/useSideBarStore";

const navLinks = [
  {
    label: "Inicio",
    href: "/admin/home",
    icon: Home,
  },
  {
    label: "Analítica",
    href: "/admin/analytics",
    icon: LineChart,
  },
  {
    label: "Pagos",
    href: "/admin/pagos",
    icon: CreditCard,
  },
  {
    label: "Mis Usuarios",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Tarifas",
    href: "/admin/tarifas",
    icon: DollarSign,
  },
  {
    label: "Cuentas",
    href: "/admin/account",
    icon: PersonStanding,
  },
  {
    label: "Configuracion",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    label: "Suscripcion",
    href: "/admin/suscripcion",
    icon: DollarSign,
  },
];

export function SidebarSimple() {
  const pathname = usePathname();

  const isOpen = useSidebarStore((state) => state.isOpen);
  const toggle = useSidebarStore((state) => state.toggle);
  const close = useSidebarStore((state) => state.close);

  const isActive = (href: string) => pathname === href;

  // no se que onda todo bien pero al parecer hubi una asistencia

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-gray-200 fixed left-0 top-0 h-full z-40 transition-all duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
        ${isOpen ? "md:w-64" : "md:w-20"}
      `}
      >
        {/* SIDEBAR HEADER */}
        <div className="h-14 px-4 flex items-center border-b border-gray-200 justify-between">
          {isOpen && (
            <h2 className="font-bold text-lg bg-gradient-to-r from-emerald-700 to-purple-800 bg-clip-text text-transparent">
              Menú
            </h2>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="h-8 w-8"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* NAVIGATION */}
        <nav className="p-3 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => {
                  if (window.innerWidth < 768) close();
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-emerald-500 to-purple-500 text-white shadow-md"
                    : "text-gray-700 hover:bg-white/50"
                }`}
                title={!isOpen ? link.label : ""}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {isOpen && (
                  <span className="text-sm font-medium">{link.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* SEPARADOR */}
        <div className="px-4">
          <div className="h-px bg-zinc-800 mb-3" />
        </div>

        {/* LOGOUT */}
        <div className="px-3 pb-4">
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 p-3 rounded-lg text-red-400
            hover:bg-red-500/10 hover:text-red-500 transition"
          >
            <LogOut size={20} />
            {isOpen && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
