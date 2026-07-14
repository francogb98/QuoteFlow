"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import {
  Bell,
  X,
  CheckCircle,
  Calendar,
  FileText,
  Trash2,
  Clock,
  XCircle,
  Info,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { es } from "date-fns/locale";

import {
  marcarNotificacionComoLeida,
  eliminarNotificacion,
  marcarTodasComoLeidas,
} from "@/actions/admin/notificaciones/notificaciones";
import { ModalComprobante } from "./ui/ModalComprobante";
import { getPagoUser } from "@/actions/admin/pago/getPagoUser";
import Link from "next/link";

interface Notificacion {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fechaCreacion: Date;
  entidadTipo?: string | null;
  entidadId?: string | null;
}

interface NotificationsDropdownProps {
  notificaciones: Notificacion[];
  onUpdate: () => void;
}

const tiposNotificacion = {
  PAGO_VENCIDO: { icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
  PAGO_PROXIMO_VENCER: {
    icon: Clock,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
  },
  COMPROBANTE_SUBIDO: { icon: Info, color: "text-blue-600", bg: "bg-blue-50" },
  COMPROBANTE_APROBADO: {
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  COMPROBANTE_RECHAZADO: {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50",
  },
  PAGO_CONFIRMADO: {
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  RECORDATORIO_PAGO: {
    icon: Bell,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  SISTEMA: { icon: Info, color: "text-purple-600", bg: "bg-purple-50" },
};

export function NotificationsDropdown({
  notificaciones,
  onUpdate,
}: NotificationsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComprobante, setSelectedComprobante] = useState<string | null>(
    null,
  );
  const [selectedPagoId, setSelectedPagoId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  /* =========================================
     FILTRAR SOLO COMPROBANTE_SUBIDO
  ========================================= */

  const notificacionesFiltradas = notificaciones.filter(
    (n) => n.tipo === "COMPROBANTE_SUBIDO",
  );

  const notificacionesNoLeidas = notificacionesFiltradas.filter(
    (n) => !n.leida,
  ).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isOpen && !target.closest("[data-notifications-dropdown]")) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen]);

  const handleVerPago = async (notificacion: Notificacion) => {
    if (!notificacion.entidadId) return;

    setLoadingId(notificacion.id);

    try {
      const result = await getPagoUser(notificacion.entidadId);

      if (result.ok && result.pago) {
        setSelectedComprobante(result.pago.comprobante);
        setSelectedPagoId(notificacion.entidadId);
        setIsModalOpen(true);
        setIsOpen(false);
      } else {
        toast.warning("No se encontró el comprobante para este pago.");
      }

      if (!notificacion.leida) {
        await marcarNotificacionComoLeida(notificacion.id);
        onUpdate();
      }
    } catch (error) {
      console.error("Error al cargar pago:", error);
    } finally {
      setLoadingId(null);
    }
  };

  const handleEliminar = async (id: string) => {
    await eliminarNotificacion(id);
    onUpdate();
    setDeleteDialogId(null);
  };

  return (
    <>
      <div className="relative" data-notifications-dropdown>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="relative p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <Bell className="w-6 h-6 text-gray-700" />

          {notificacionesNoLeidas > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-600 text-white">
              {notificacionesNoLeidas}
            </Badge>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-[420px] max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border z-50 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-purple-600 p-4 text-white">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold flex items-center gap-2">
                  <Bell className="w-4 h-4" /> Notificaciones
                </h3>

                <button onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              {notificacionesNoLeidas > 0 && (
                <button
                  onClick={() => marcarTodasComoLeidas().then(onUpdate)}
                  className="text-xs mt-2 underline"
                >
                  Marcar todas como leídas ({notificacionesNoLeidas})
                </button>
              )}
            </div>

            <div
              ref={listRef}
              className="max-h-[360px] overflow-y-auto overscroll-contain divide-y"
            >
              {notificacionesFiltradas.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  No tienes notificaciones
                </div>
              ) : (
                notificacionesFiltradas.map((notificacion) => {
                  const config =
                    tiposNotificacion[
                      notificacion.tipo as keyof typeof tiposNotificacion
                    ] || tiposNotificacion.SISTEMA;

                  const Icon = config.icon;

                  const esPago =
                    notificacion.entidadTipo === "PAGO" ||
                    notificacion.tipo.includes("COMPROBANTE");

                  const isLoading = loadingId === notificacion.id;

                  return (
                    <div
                      key={notificacion.id}
                      //@ts-ignore
                      ref={(el) => (itemRefs.current[notificacion.id] = el)}
                      className={`p-4 hover:bg-gray-50 transition ${
                        !notificacion.leida ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className={`p-2 h-fit rounded-lg ${config.bg}`}>
                          <Icon className={`w-4 h-4 ${config.color}`} />
                        </div>

                        <div className="flex-1">
                          <h4 className="text-sm font-semibold">
                            {notificacion.titulo}
                          </h4>

                          <p className="text-xs text-gray-600 mt-1">
                            {notificacion.mensaje}
                          </p>

                          <div className="flex justify-between items-center mt-3">
                            <span className="text-[10px] text-gray-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDistanceToNow(
                                new Date(notificacion.fechaCreacion),
                                { addSuffix: true, locale: es },
                              )}
                            </span>

                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={!esPago || !!loadingId}
                                onClick={() => handleVerPago(notificacion)}
                                className={`h-7 px-2 text-xs ${
                                  esPago
                                    ? "text-emerald-600 hover:bg-emerald-50"
                                    : "opacity-0 pointer-events-none"
                                }`}
                              >
                                {isLoading ? (
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                ) : (
                                  <FileText className="w-3 h-3 mr-1" />
                                )}
                                Ver pago
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteDialogId(notificacion.id);
                                }}
                                className="h-7 w-7 p-0 text-gray-400 hover:text-red-600"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t p-3 text-center bg-gray-50">
              <Link
                href="/admin/notificaciones"
                onClick={() => setIsOpen(false)}
                className="text-sm text-emerald-600 font-medium hover:underline block w-full h-full"
              >
                Ver todas las notificaciones
              </Link>
            </div>
          </div>
        )}
      </div>

      <ModalComprobante
        isOpen={isModalOpen}
        imageUrl={selectedComprobante}
        pagoId={selectedPagoId}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedComprobante(null);
          setSelectedPagoId(null);
        }}
        onUpdate={onUpdate}
      />

      <AlertDialog
        open={!!deleteDialogId}
        onOpenChange={() => setDeleteDialogId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar notificación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar esta notificación? Esta acción
              no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialogId && handleEliminar(deleteDialogId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
