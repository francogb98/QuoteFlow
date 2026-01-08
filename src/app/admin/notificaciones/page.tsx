"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  CheckCircle,
  Trash2,
  Calendar,
  User,
  Info,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Loader2,
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
import { toast } from "sonner";
import { ModalComprobante } from "@/01-components/admin/ui/ModalComprobante";
import { getPagoUser } from "@/01-actions/admin/pago/getPagoUser";

interface Notificacion {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fechaCreacion: Date;
  fechaLeida?: Date;
  entidadId?: string | null; // Asegúrate de incluir estos campos
  entidadTipo?: string | null;
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

  // Estados para el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComprobante, setSelectedComprobante] = useState<string | null>(
    null
  );
  const [selectedPagoId, setSelectedPagoId] = useState<string | null>(null);
  const [loadingPagoId, setLoadingPagoId] = useState<string | null>(null);

  const cargarNotificaciones = useCallback(async () => {
    setCargando(true);
    try {
      const resultado = await obtenerNotificaciones(page, 20);
      if (resultado.success) {
        setNotificaciones(resultado.notificaciones as any);
        setPagination(resultado.pagination);
      }
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
    } finally {
      setCargando(false);
    }
  }, [page]);

  useEffect(() => {
    cargarNotificaciones();
  }, [cargarNotificaciones]);

  const handleVerPago = async (notificacion: Notificacion) => {
    if (!notificacion.entidadId) return;

    setLoadingPagoId(notificacion.id);
    try {
      const result = await getPagoUser(notificacion.entidadId);
      if (result.ok && result.pago) {
        setSelectedComprobante(result.pago.comprobante);
        setSelectedPagoId(notificacion.entidadId);
        setIsModalOpen(true);

        // Si no está leída, marcarla al abrir
        if (!notificacion.leida) {
          handleMarcarComoLeida(notificacion.id);
        }
      } else {
        toast.error("No se encontró el comprobante para este pago.");
      }
    } catch (error) {
      toast.error("Error al obtener los datos del pago.");
    } finally {
      setLoadingPagoId(null);
    }
  };

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
      toast.success("Notificación eliminada");
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
                {(["todas", "no_leidas", "leidas"] as const).map((f) => (
                  <Button
                    key={f}
                    variant={filtro === f ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFiltro(f)}
                    className="capitalize relative"
                  >
                    {f.replace("_", " ")}
                    {f === "no_leidas" && noLeidasCount > 0 && (
                      <Badge className="ml-2 bg-red-500 text-white">
                        {noLeidasCount}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>

              <select
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos los tipos</option>
                {Object.keys(tiposNotificacion).map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Lista */}
        {cargando ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
          </div>
        ) : notificacionesFiltradas.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">
                Sin notificaciones
              </h3>
              <p className="text-gray-500">
                No hay nada que mostrar con estos filtros.
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

              // Lógica para mostrar botón "Ver Pago"
              const esComprobante =
                notificacion.entidadTipo === "PAGO" ||
                notificacion.tipo.includes("COMPROBANTE");
              const isLoadingThis = loadingPagoId === notificacion.id;

              return (
                <Card
                  key={notificacion.id}
                  className={`transition-all duration-200 hover:shadow-md ${
                    !notificacion.leida
                      ? `${tipoConfig.bg} ${tipoConfig.border} border-l-4 border-l-blue-600`
                      : "bg-white border-gray-200"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-xl ${tipoConfig.bg}`}>
                        <IconoTipo className={`w-5 h-5 ${tipoConfig.color}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3
                              className={`font-bold ${!notificacion.leida ? "text-gray-900" : "text-gray-700"}`}
                            >
                              {notificacion.titulo}
                            </h3>
                            <p
                              className={`text-sm mt-1 leading-relaxed ${!notificacion.leida ? "text-gray-800" : "text-gray-600"}`}
                            >
                              {notificacion.mensaje}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 mt-3 text-[11px] font-medium text-gray-500">
                              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-white/50 rounded-full border">
                                <Calendar className="w-3 h-3" />
                                {formatDistanceToNow(
                                  new Date(notificacion.fechaCreacion),
                                  { addSuffix: true, locale: es }
                                )}
                              </span>

                              {notificacion.remitente && (
                                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-white/50 rounded-full border">
                                  <User className="w-3 h-3" />
                                  {notificacion.remitente.nombre}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {esComprobante && (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={!!loadingPagoId}
                                onClick={() => handleVerPago(notificacion)}
                                className="h-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                              >
                                {isLoadingThis ? (
                                  <Loader2 className="w-3 h-3 animate-spin mr-2" />
                                ) : (
                                  <FileText className="w-3 h-3 mr-2" />
                                )}
                                Ver pago
                              </Button>
                            )}

                            {!notificacion.leida && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleMarcarComoLeida(notificacion.id)
                                }
                                className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEliminar(notificacion.id)}
                              className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
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
          <div className="flex justify-center items-center gap-4 pt-4">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Anterior
            </Button>
            <span className="text-sm font-medium">
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

      {/* Modal de Comprobante */}
      <ModalComprobante
        isOpen={isModalOpen}
        imageUrl={selectedComprobante}
        pagoId={selectedPagoId}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedComprobante(null);
          setSelectedPagoId(null);
        }}
        onUpdate={cargarNotificaciones} // Recarga la lista tras aprobar/rechazar
      />
    </div>
  );
}
