// src/01-components/admin/notificaciones/notificaciones-panel.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, X } from "lucide-react";

import {
  marcarTodasComoLeidas,
  obtenerNotificaciones,
} from "@/01-actions/admin/notificaciones/notificaciones";
import { NotificacionItem } from "./NotificacionItem";
import { ComprobanteModal } from "./ComprobanteModal";
import Link from "next/link";
interface Notificacion {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fechaCreacion: Date;
  fechaLeida?: Date;
  remitente?: {
    nombre: string;
    email: string;
  };
}

interface NotificacionesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificacionesChange: (count: number) => void;
}

export function NotificacionesPanel({
  isOpen,
  onClose,
  onNotificacionesChange,
}: NotificacionesPanelProps) {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [cargando, setCargando] = useState(false);
  const [filtro, setFiltro] = useState<"todas" | "no_leidas">("todas");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagoSelected, setPagoSelected] = useState<null | any>(null);

  // Solución: Usar useCallback para memorizar la función
  const cargarNotificaciones = useCallback(async () => {
    setCargando(true);
    try {
      const resultado = await obtenerNotificaciones(1, 50);
      if (resultado.success) {
        //@ts-ignore
        setNotificaciones(resultado.notificaciones);
        const noLeidas = resultado.notificaciones.filter(
          (n) => !n.leida
        ).length;
        onNotificacionesChange(noLeidas);
      }
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
    } finally {
      setCargando(false);
    }
  }, [onNotificacionesChange]); // Dependencia: onNotificacionesChange

  useEffect(() => {
    if (isOpen) {
      cargarNotificaciones();
    }
  }, [isOpen, cargarNotificaciones]);

  const handleMarcarTodasComoLeidas = async () => {
    const resultado = await marcarTodasComoLeidas();
    if (resultado.success) {
      setNotificaciones((prev) => {
        const updated = prev.map((n) => ({
          ...n,
          leida: true,
          fechaLeida: new Date(),
        }));
        onNotificacionesChange(0);
        return updated;
      });
    }
  };

  const notificacionesFiltradas = notificaciones.filter((notif) => {
    if (filtro === "no_leidas" && notif.leida) return false;
    return true;
  });

  const noLeidasCount = notificaciones.filter((n) => !n.leida).length;

  return (
    <div
      className={`
        bg-white/90 backdrop-blur-md h-screen border-r border-purple-100 shadow-xl
        transition-all duration-300 ease-in-out
        ${isOpen ? "w-80" : "w-0"}
        overflow-hidden
      `}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 min-h-[73px]">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Notificaciones
              </h2>
              {noLeidasCount > 0 && (
                <p className="text-sm text-blue-600">
                  {noLeidasCount} sin leer
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Filtros y acciones */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-2">
              <Button
                variant={filtro === "todas" ? "default" : "outline"}
                size="sm"
                onClick={() => setFiltro("todas")}
                className="text-xs"
              >
                Todas
              </Button>
              <Button
                variant={filtro === "no_leidas" ? "default" : "outline"}
                size="sm"
                onClick={() => setFiltro("no_leidas")}
                className="text-xs relative"
              >
                Sin leer
                {noLeidasCount > 0 && (
                  <Badge className="ml-1 bg-red-500 text-white text-xs px-1 py-0 h-4 min-w-4">
                    {noLeidasCount}
                  </Badge>
                )}
              </Button>
            </div>

            {noLeidasCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarcarTodasComoLeidas}
                className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Marcar todas
              </Button>
            )}
          </div>
        </div>

        {/* Lista de notificaciones */}
        <div className="flex-1 overflow-y-auto">
          {cargando ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : notificacionesFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <Bell className="w-12 h-12 text-gray-300 mb-3" />
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                No hay notificaciones
              </h3>
              <p className="text-xs text-gray-500 text-center">
                {filtro === "no_leidas"
                  ? "No tienes notificaciones sin leer"
                  : "Cuando tengas notificaciones aparecerán aquí"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notificacionesFiltradas.map((notificacion) => (
                <NotificacionItem
                  key={notificacion.id}
                  notificacion={notificacion}
                  setNotificaciones={setNotificaciones}
                  onNotificacionesChange={onNotificacionesChange}
                  setIsModalOpen={setIsModalOpen}
                  setPagoSelected={setPagoSelected}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notificacionesFiltradas.length > 0 && (
          <div className="p-4 border-t text-center bg-gray-50">
            <Link
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              href="/admin/notificaciones"
            >
              Ver todas las notificaciones
            </Link>
          </div>
        )}
      </div>

      {
        <ComprobanteModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          pago={pagoSelected}
        />
      }
    </div>
  );
}
