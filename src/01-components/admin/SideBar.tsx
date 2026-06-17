"use client";
import type React from "react";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
  Menu,
  CreditCard,
  LogInIcon as Logs,
  Tag,
  DollarSign,
  Bell,
  BellRing,
  X,
  User2,
  TestTube,
  Heart,
} from "lucide-react";
import { logout } from "@/01-actions/auth/logout";
import { QuoteFlowLogo } from "@/lib/Logo";
import { NotificacionesPanel } from "./notificaciones/notificaciones-panel";
import { obtenerNotificacionesNoLeidas } from "@/01-actions/admin/notificaciones/notificaciones";
import { IoCardSharp } from "react-icons/io5";
interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  onClick?: () => void;
  isButton?: boolean;
}

export const Sidebar = ({ user }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAccountExpanded, setIsAccountExpanded] = useState(false);
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(0);
  const [notificacionesPanelOpen, setNotificacionesPanelOpen] = useState(false);
  const [sidebarCollapsedByPanel, setSidebarCollapsedByPanel] = useState(false);
  const pathname = usePathname();

  // Cargar notificaciones no leídas
  useEffect(() => {
    const cargarNotificaciones = async () => {
      try {
        const resultado = await obtenerNotificacionesNoLeidas();
        if (resultado.success) {
          setNotificacionesNoLeidas(resultado.count || 0);
        }
      } catch (error) {
        console.error("Error al cargar notificaciones:", error);
      }
    };

    cargarNotificaciones();

    // Actualizar cada 30 segundos
    const interval = setInterval(cargarNotificaciones, 30000);
    return () => clearInterval(interval);
  }, []);

  // Manejar el colapso automático cuando se abre el panel de notificaciones
  useEffect(() => {
    if (notificacionesPanelOpen) {
      // Si el sidebar no estaba colapsado, guardamos el estado y lo colapsamos
      if (!isCollapsed) {
        setSidebarCollapsedByPanel(true);
        setIsCollapsed(true);
      }
    } else {
      // Si el panel se cierra y el sidebar fue colapsado por el panel, lo expandimos
      if (sidebarCollapsedByPanel) {
        setIsCollapsed(false);
        setSidebarCollapsedByPanel(false);
      }
    }
  }, [notificacionesPanelOpen, isCollapsed, sidebarCollapsedByPanel]);

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
    // Solo permitir colapso manual si el panel no está abierto
    if (!notificacionesPanelOpen) {
      setIsCollapsed(!isCollapsed);
      setSidebarCollapsedByPanel(false);
    }
  };

  const handleNotificacionesClick = () => {
    setNotificacionesPanelOpen(!notificacionesPanelOpen);
    setIsOpen(false); // Cerrar sidebar en mobile
  };

  const handleNotificacionesClickMobile = () => {
    redirect("/admin/notificaciones");
  };

  const handleCloseNotificaciones = () => {
    setNotificacionesPanelOpen(false);
  };

  const allNavItems: NavItem[] = [
    {
      href: "/admin/home",
      icon: <Home size={20} />,
      label: "Home",
    },
    { href: "/admin/users", icon: <Users size={20} />, label: "Usuarios" },
    { href: "/admin/pagos", icon: <IoCardSharp size={20} />, label: "Pagos" },
    {
      href: "#",
      icon: <BellRing size={20} />,
      label: "Notificaciones",
      badge: notificacionesNoLeidas > 0 ? notificacionesNoLeidas : undefined,
      onClick: handleNotificacionesClick,
      isButton: true,
    },
    {
      href: "/admin/settings",
      icon: <Settings size={20} />,
      label: "Configuracion",
    },
    {
      href: "/admin/account",
      icon: <User2 size={20} />,
      label: "Cuentas",
    },
    {
      href: "/admin/market",
      icon: <CreditCard size={20} />,
      label: "Conexión Mercado Pago",
    },
    {
      href: "/admin/logs",
      icon: <Logs size={20} />,
      label: "Logs",
    },
    {
      href: "/admin/codigos",
      icon: <Tag size={20} />,
      label: "Codigos",
    },
    {
      href: "/admin/test",
      icon: <TestTube size={20} />,
      label: "Test",
    },
  ];

  // Filtrar items de navegación según el rol del usuario
  const navItems = allNavItems.filter((item) => {
    const isSuperAdmin = user?.rol === "SUPER_ADMIN";

    if (item.label === "Logs") {
      return isSuperAdmin;
    }
    if (item.label === "Codigos") {
      return isSuperAdmin;
    }
    // Billing-related items are irrelevant for SUPER_ADMIN
    if (item.label === "Pagos" && isSuperAdmin) {
      return false;
    }
    if (item.label === "Conexión Mercado Pago" && isSuperAdmin) {
      return false;
    }
    if (item.label === "Mi Suscripción") {
      // Ocultar a profesores y a SUPER_ADMIN (no tienen suscripción propia)
      return !isSuperAdmin && user?.rol !== "PROFESOR";
    }
    if (item.label === "Cuentas") {
      return user?.rol !== "PROFESOR";
    }
    return true;
  });

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
          {/* Notificaciones en mobile header */}
          <button
            onClick={handleNotificacionesClickMobile}
            className="hidden relative p-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Bell size={20} />
            {notificacionesNoLeidas > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {notificacionesNoLeidas > 99 ? "99+" : notificacionesNoLeidas}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed top-0 left-0 h-screen w-screen bg-black/50 z-20 backdrop-blur-sm md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Container para sidebar y panel de notificaciones */}
      <div className="flex">
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
          {/* Botón para colapsar/expandir (solo desktop y si panel no está abierto) */}
          {!notificacionesPanelOpen && (
            <button
              className="absolute -right-3 top-6 hidden md:flex items-center justify-center
                              bg-white/90 backdrop-blur-sm rounded-full border border-purple-200 w-7 h-7
                              shadow-lg hover:shadow-xl transition-all duration-100 hover:scale-110
                              hover:bg-gradient-to-r hover:from-purple-500 hover:to-violet-600 hover:text-white hover:border-transparent"
              onClick={toggleCollapse}
              aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
            >
              {isCollapsed ? (
                <ChevronRight size={14} />
              ) : (
                <ChevronLeft size={14} />
              )}
            </button>
          )}

          {/* Contenido del Sidebar */}
          <div className="h-full flex flex-col overflow-hidden">
            {/* Logo/Header */}
            <div className="p-6 border-b border-purple-100">
              <div className="flex items-center justify-between">
                {!isCollapsed ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                      <QuoteFlowLogo size="sm" variant="icon" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent">
                        Admin Panel
                      </h2>
                      <p className="text-xs text-purple-500">
                        Panel de Control
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center w-full">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                      <QuoteFlowLogo size="sm" variant="icon" />
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
            <nav className="flex-1 p-4 overflow-y-auto overflow-x-hidden">
              <ul className="space-y-2">
                {navItems.map((item) => {
                  const isActive =
                    pathname.startsWith(item.href) && item.href !== "#";
                  const isNotificationActive =
                    item.label === "Notificaciones" && notificacionesPanelOpen;
                  const isAccountItem = item.label === "Cuenta";

                  if (item.label === "Notificaciones")
                    return (
                      <button
                        className={`
                            flex items-center p-3 rounded-xl transition-all duration-300 w-full
                            ${
                              isAccountExpanded || isActive
                                ? "bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg transform scale-105"
                                : "text-purple-600 hover:bg-purple-50 hover:text-purple-700 hover:shadow-md hover:scale-102"
                            }
                            ${isCollapsed ? "justify-center" : ""}
                            ${item.label === "Notificaciones" ? "hidden sm:flex" : ""}
                          `}
                        onClick={item.onClick}
                        aria-expanded={isAccountExpanded}
                        key={item.href + item.label}
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
                      </button>
                    );

                  return (
                    <li key={item.href + item.label}>
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
                            ${item.label === "Notificaciones" ? "hidden sm:flex" : ""}
                          `}
                            onClick={() =>
                              setIsAccountExpanded(!isAccountExpanded)
                            }
                            aria-expanded={isAccountExpanded}
                          >
                            <span
                              className={`${isCollapsed ? "mr-0" : "mr-3"} ${
                                isAccountExpanded || isActive
                                  ? "text-white"
                                  : ""
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
                      ) : item.isButton ? (
                        <button
                          onClick={item.onClick}
                          className={`
                            flex items-center p-3 rounded-xl transition-all duration-300 relative w-full
                            ${
                              isActive || isNotificationActive
                                ? "bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg transform scale-105"
                                : "text-purple-600 hover:bg-purple-50 hover:text-purple-700 hover:shadow-md hover:scale-102"
                            }
                            ${isCollapsed ? "justify-center" : ""}
                            ${item.label === "Notificaciones" ? "hidden sm:flex" : ""}
                          `}
                        >
                          <span
                            className={`${isCollapsed ? "mr-0" : "mr-3"} ${
                              isActive || isNotificationActive
                                ? "text-white"
                                : ""
                            } relative`}
                          >
                            {item.icon}
                            {/* Badge de notificaciones */}
                            {item.badge && item.badge > 0 && (
                              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                {item.badge > 99 ? "99+" : item.badge}
                              </span>
                            )}
                          </span>
                          <span
                            className={`${
                              isCollapsed ? "hidden" : "block"
                            } font-medium flex-1`}
                          >
                            {item.label}
                          </span>
                          {/* Badge para sidebar expandido */}
                          {!isCollapsed && item.badge && item.badge > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                              {item.badge > 99 ? "99+" : item.badge}
                            </span>
                          )}
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          className={`
                            flex items-center p-3 rounded-xl transition-all duration-300 relative
                            ${
                              isActive
                                ? "bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg transform scale-105"
                                : "text-purple-600 hover:bg-purple-50 hover:text-purple-700 hover:shadow-md hover:scale-102"
                            }
                            ${isCollapsed ? "justify-center" : ""}
                            ${item.label === "Notificaciones" ? "hidden sm:flex" : ""}
                          `}
                          onClick={() => setIsOpen(false)}
                        >
                          <span
                            className={`${isCollapsed ? "mr-0" : "mr-3"} ${
                              isActive ? "text-white" : ""
                            } relative`}
                          >
                            {item.icon}
                          </span>
                          <span
                            className={`${
                              isCollapsed ? "hidden" : "block"
                            } font-medium flex-1`}
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
                      flex items-center p-3 rounded-xl transition-all duration-300 w-full
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

        {/* Panel de notificaciones - Solo en desktop */}
        <div className="hidden md:block">
          <NotificacionesPanel
            isOpen={notificacionesPanelOpen}
            onClose={handleCloseNotificaciones}
            onNotificacionesChange={setNotificacionesNoLeidas}
          />
        </div>
      </div>

      {/* Panel de notificaciones para mobile - Modal overlay */}
      {notificacionesPanelOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={handleCloseNotificaciones}
          />
          <div className="absolute inset-x-0 top-0 h-full bg-white">
            <NotificacionesPanel
              isOpen={notificacionesPanelOpen}
              onClose={handleCloseNotificaciones}
              onNotificacionesChange={setNotificacionesNoLeidas}
            />
          </div>
        </div>
      )}
    </>
  );
};
