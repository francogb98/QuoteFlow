// src/app/admin/notificaciones/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  CheckCircle,
  Trash2,
  BookMarkedIcon as MarkAsUnread,
  Calendar,
  User,
  Info,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  obtenerNotificaciones,
  eliminarNotificacion,
  marcarTodasComoLeidas,
  marcarNotificacionComoLeida,
} from "@/01-actions/admin/notificaciones/notificaciones";
import { useSearchParams } from "next/navigation";
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

const tiposNotificacion = {
  PAGO_VENCIDO: {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
  },
  PAGO_PROXIMO_VENCER: {
    icon: Clock,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
  },
  COMPROBANTE_SUBIDO: {
    icon: Info,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  COMPROBANTE_APROBADO: {
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  COMPROBANTE_RECHAZADO: {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
  },
  PAGO_CONFIRMADO: {
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  RECORDATORIO_PAGO: {
    icon: Bell,
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
  },
  SISTEMA: {
    icon: Info,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
  },
};

export default function NotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState<"todas" | "no_leidas" | "leidas">(
    "todas"
  );
  const [tipoFiltro, setTipoFiltro] = useState<string>("todos");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  // Solución: Usar useCallback para memorizar la función
  const cargarNotificaciones = useCallback(async () => {
    setCargando(true);
    try {
      const resultado = await obtenerNotificaciones(page, 20);
      if (resultado.success) {
        //@ts-ignore
        setNotificaciones(resultado.notificaciones);
        setPagination(resultado.pagination);
      }
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
    } finally {
      setCargando(false);
    }
  }, [page]); // Dependencia: page

  useEffect(() => {
    cargarNotificaciones();
  }, [page, cargarNotificaciones]);

  const handleMarcarComoLeida = async (id: string) => {
    const resultado = await marcarNotificacionComoLeida(id);
    if (resultado.success) {
      setNotificaciones((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, leida: true, fechaLeida: new Date() } : n
        )
      );
    }
  };

  const handleMarcarTodasComoLeidas = async () => {
    const resultado = await marcarTodasComoLeidas();
    if (resultado.success) {
      setNotificaciones((prev) =>
        prev.map((n) => ({ ...n, leida: true, fechaLeida: new Date() }))
      );
    }
  };

  const handleEliminar = async (id: string) => {
    const resultado = await eliminarNotificacion(id);
    if (resultado.success) {
      setNotificaciones((prev) => prev.filter((n) => n.id !== id));
    }
  };

  const notificacionesFiltradas = notificaciones.filter((notif) => {
    if (filtro === "no_leidas" && notif.leida) return false;
    if (filtro === "leidas" && !notif.leida) return false;
    if (tipoFiltro !== "todos" && notif.tipo !== tipoFiltro) return false;
    return true;
  });

  const noLeidasCount = notificaciones.filter((n) => !n.leida).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Bell className="w-8 h-8 text-blue-600" />
              Notificaciones
            </h1>
            <p className="text-gray-600 mt-1">
              Gestiona tus notificaciones y mantente al día
            </p>
          </div>

          {noLeidasCount > 0 && (
            <Button
              onClick={handleMarcarTodasComoLeidas}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Marcar todas como leídas ({noLeidasCount})
            </Button>
          )}
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex gap-2">
                <Button
                  variant={filtro === "todas" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltro("todas")}
                >
                  Todas
                </Button>
                <Button
                  variant={filtro === "no_leidas" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltro("no_leidas")}
                  className="relative"
                >
                  No leídas
                  {noLeidasCount > 0 && (
                    <Badge className="ml-2 bg-red-500 text-white">
                      {noLeidasCount}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant={filtro === "leidas" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltro("leidas")}
                >
                  Leídas
                </Button>
              </div>

              <select
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="todos">Todos los tipos</option>
                <option value="PAGO_VENCIDO">Pagos vencidos</option>
                <option value="PAGO_PROXIMO_VENCER">Próximos a vencer</option>
                <option value="COMPROBANTE_SUBIDO">Comprobantes subidos</option>
                <option value="COMPROBANTE_APROBADO">
                  Comprobantes aprobados
                </option>
                <option value="PAGO_CONFIRMADO">Pagos confirmados</option>
                <option value="SISTEMA">Sistema</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de notificaciones */}
        {cargando ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : notificacionesFiltradas.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay notificaciones
              </h3>
              <p className="text-gray-600">
                {filtro === "no_leidas"
                  ? "No tienes notificaciones sin leer"
                  : "No se encontraron notificaciones con los filtros seleccionados"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notificacionesFiltradas.map((notificacion) => {
              const tipoConfig =
                tiposNotificacion[
                  notificacion.tipo as keyof typeof tiposNotificacion
                ] || tiposNotificacion.SISTEMA;
              const IconoTipo = tipoConfig.icon;

              return (
                <Card
                  key={notificacion.id}
                  className={`transition-all duration-200 hover:shadow-md ${
                    !notificacion.leida
                      ? `${tipoConfig.bg} ${tipoConfig.border} border-l-4`
                      : "bg-white border-gray-200"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full ${tipoConfig.bg}`}>
                        <IconoTipo className={`w-5 h-5 ${tipoConfig.color}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3
                              className={`font-semibold ${!notificacion.leida ? "text-gray-900" : "text-gray-700"}`}
                            >
                              {notificacion.titulo}
                            </h3>
                            <p
                              className={`text-sm mt-1 ${!notificacion.leida ? "text-gray-800" : "text-gray-600"}`}
                            >
                              {notificacion.mensaje}
                            </p>

                            {notificacion.tipo === "COMPROBANTE_SUBIDO" && (
                              <Link
                                href={`/admin/pagos`}
                                className="text-blue-600 hover:underline text-sm"
                              >
                                Ver pago
                              </Link>
                            )}

                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDistanceToNow(
                                  new Date(notificacion.fechaCreacion),
                                  {
                                    addSuffix: true,
                                    locale: es,
                                  }
                                )}
                              </span>

                              {notificacion.remitente && (
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {notificacion.remitente.nombre}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {!notificacion.leida && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}

                            <div className="flex gap-1">
                              {!notificacion.leida && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleMarcarComoLeida(notificacion.id)
                                  }
                                  className="h-8 w-8 p-0"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEliminar(notificacion.id)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Paginación */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Anterior
            </Button>

            <span className="flex items-center px-4 text-sm text-gray-600">
              Página {page} de {pagination.pages}
            </span>

            <Button
              variant="outline"
              disabled={page === pagination.pages}
              onClick={() => setPage(page + 1)}
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
