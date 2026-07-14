import {
  eliminarNotificacion,
  marcarNotificacionComoLeida,
} from "@/actions/admin/notificaciones/notificaciones";
import { Button } from "@/components/ui/button";
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
import { es } from "date-fns/locale";
import {
  XCircle,
  Clock,
  Info,
  CheckCircle2,
  CheckCircle,
  Bell,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

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

export const NotificacionItem = ({
  notificacion,
  setNotificaciones,
  onNotificacionesChange,
}: any) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const tipoConfig =
    tiposNotificacion[notificacion.tipo as keyof typeof tiposNotificacion] ||
    tiposNotificacion.SISTEMA;
  const IconoTipo = tipoConfig.icon;

  const handleMarcarComoLeida = async (id: string) => {
    const resultado = await marcarNotificacionComoLeida(id);
    if (resultado.success) {
      setNotificaciones((prev: any) => {
        const updated = prev.map((n: any) =>
          n.id === id ? { ...n, leida: true, fechaLeida: new Date() } : n
        );
        const noLeidas = updated.filter((n: any) => !n.leida).length;
        onNotificacionesChange(noLeidas);
        return updated;
      });
    }
  };

  const handleEliminar = async (id: string) => {
    const resultado = await eliminarNotificacion(id);
    if (resultado.success) {
      setNotificaciones((prev: any) => {
        const updated = prev.filter((n: any) => n.id !== id);
        const noLeidas = updated.filter((n: any) => !n.leida).length;
        onNotificacionesChange(noLeidas);
        return updated;
      });
    }
  };

  return (
    <>
      <div
        key={notificacion.id}
        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
          !notificacion.leida ? "bg-blue-50/50 border-l-2 border-l-blue-500" : ""
        }`}
        onClick={() =>
          !notificacion.leida && handleMarcarComoLeida(notificacion.id)
        }
      >
        <div className="flex gap-3">
          <div className={`p-1.5 rounded-full ${tipoConfig.bg} flex-shrink-0`}>
            <IconoTipo className={`w-4 h-4 ${tipoConfig.color}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <Link
                href={`/admin/notificaciones/${notificacion.id}`}
                className="flex-1"
              >
                <h4
                  className={`text-sm font-medium ${!notificacion.leida ? "text-gray-900" : "text-gray-700"}`}
                >
                  {notificacion.titulo}
                </h4>
                <p
                  className={`text-xs mt-1 line-clamp-2 ${!notificacion.leida ? "text-gray-800" : "text-gray-600"}`}
                >
                  {notificacion.mensaje}
                </p>

                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(notificacion.fechaCreacion), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </span>

                  {!notificacion.leida && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </Link>

              <div className="flex items-center gap-1">
                {!notificacion.leida && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarcarComoLeida(notificacion.id);
                    }}
                    className="h-6 w-6 p-0 hover:bg-blue-100"
                  >
                    <CheckCircle className="w-3 h-3 text-blue-600" />
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteDialog(true);
                  }}
                  className="h-6 w-6 p-0 hover:bg-red-100"
                >
                  <Trash2 className="w-3 h-3 text-red-600" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
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
              onClick={() => handleEliminar(notificacion.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
