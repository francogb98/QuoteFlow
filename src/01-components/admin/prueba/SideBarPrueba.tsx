"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  Menu,
  X,
  LineChart,
  CreditCard,
  Settings,
  Home,
  DollarSign,
  LogOut,
  PersonStanding,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/lib/store/useSideBarStore";
import { signOut } from "next-auth/react";

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
    label: "Tarifas",
    href: "/admin/tarifas",
    icon: DollarSign,
  },
  {
    label: "Cuentas",
    href: "/admin/account",
    icon: PersonStanding,
    pro: false,
  },
  {
    label: "Configuracion",
    href: "/admin/settings",
    icon: Settings,
  },
];

interface Props {
  user: any;
}

export function SidebarSimple({ user }: Props) {
  const pathname = usePathname();
  const plan = user?.empresa?.suscripcion?.planTipo;

  const isOpen = useSidebarStore((state) => state.isOpen);
  const toggle = useSidebarStore((state) => state.toggle);
  const open = useSidebarStore((state) => state.open);
  const close = useSidebarStore((state) => state.close);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    const handle = (event: MediaQueryListEvent | MediaQueryList) => {
      if (event.matches) {
        open();
      } else {
        close();
      }
    };

    handle(mediaQuery);

    const listener = (e: MediaQueryListEvent) => handle(e);

    mediaQuery.addEventListener("change", listener);

    return () => mediaQuery.removeEventListener("change", listener);
  }, [open, close]);

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-gray-200 fixed left-0 top-0 h-full z-40 transition-all duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
        ${isOpen ? "md:w-64" : "md:w-20"}`}
      >
        {/* Header */}
        <div className="h-14 px-4 flex items-center border-b border-gray-200 justify-between">
          {isOpen && (
            <h2 className="font-bold text-lg bg-gradient-to-r from-emerald-700 to-purple-800 bg-clip-text text-transparent">
              Menú
            </h2>
          )}

          <Button variant="ghost" size="icon" onClick={toggle}>
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-2">
          {navLinks
            .filter((link) => !link.pro || plan === "PRO")
            .map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    if (window.innerWidth < 768) close();
                  }}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                  ${
                    active
                      ? "bg-gradient-to-r from-emerald-500 to-purple-500 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={20} />
                  {isOpen && (
                    <span className="text-sm font-medium">{link.label}</span>
                  )}
                </Link>
              );
            })}
        </nav>

        {/* Divider */}
        <div className="px-4">
          <div className="h-px bg-gray-200 mb-3" />
        </div>

        {/* Logout */}
        <div className="px-3 pb-4">
          <button
            onClick={() =>
              signOut({ callbackUrl: "https://cuotafacil.com.ar" })
            }
            className="w-full flex items-center gap-3 p-3 rounded-lg text-red-500 hover:bg-red-50 transition"
          >
            <LogOut size={20} />
            {isOpen && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
