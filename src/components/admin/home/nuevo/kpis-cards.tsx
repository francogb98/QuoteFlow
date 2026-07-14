"use client";

import {
  Users,
  DollarSign,
  Clock,
  AlertTriangle,
  Loader2,
  Save,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { ScrollArea } from "@/components/ui/scroll-area";

import { KpiData, PaymentDetailRow } from "@/lib/data/dashboardQueries";

import { startTransition, useState } from "react";

import { toast } from "sonner";
import { updateTelefonoUsuario } from "@/actions/admin/home/kpi/updateTelefonoUsuario";

// Interfaz para usuarios sin teléfono
interface UsuarioSinTelefono {
  id: string;
  nombre: string;
  apellido: string;
  documento?: string | null;
}

interface KpiCardsProps {
  data: KpiData;
  pagosPagados: PaymentDetailRow[];
  pagosPendientes: PaymentDetailRow[];
  pagosVencidos: PaymentDetailRow[];
  usuariosSinTelefonoList: UsuarioSinTelefono[];
  dominioLink: string;
  empresaSlug: string;
}

// Helper: Días restantes (del segundo código)
const getDaysUntil = (dateString: string | null) => {
  if (!dateString) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateString);
  due.setHours(0, 0, 0, 0);
  const diff = due.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export function KpiCards({
  data,
  pagosPagados,
  pagosPendientes,
  pagosVencidos,
  usuariosSinTelefonoList,
  dominioLink,
  empresaSlug,
}: KpiCardsProps) {
  const [modalOpen, setModalOpen] = useState<string | null>(null);

  // Estados para edición de teléfono (primer código)
  const [telefonos, setTelefonos] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  // Determina qué lista mostrar según el modal activo
  const getActiveList = () => {
    switch (modalOpen) {
      case "pagados":
        return pagosPagados;
      case "pendientes":
        return pagosPendientes;
      case "vencidos":
        return pagosVencidos;
      case "sinTelefono":
        return usuariosSinTelefonoList;
      default:
        return [];
    }
  };

  const activeList: any[] = getActiveList();

  const kpiItems = [
    {
      key: null,
      title: "Total Usuarios",
      value: data.totalUsuarios.toString(),
      subtitle: `${data.usuariosActivos} activos`,
      icon: Users,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      key: "pagados",
      title: "Recaudado del Mes",
      value: `$${data.totalRecaudado.toLocaleString("es-AR")}`,
      subtitle: "este periodo",
      icon: DollarSign,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      key: "pendientes",
      title: "Pagos Pendientes",
      value: data.pagosPendientes.toString(),
      subtitle: "por cobrar",
      icon: Clock,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      key: "vencidos",
      title: "Pagos Vencidos",
      value: data.pagosVencidos.toString(),
      subtitle: "requieren atencion",
      icon: AlertTriangle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
  ];

  // Helpers de formato
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
    });
  };

  const formatCurrency = (value: number) => `$${value.toLocaleString("es-AR")}`;

  const formatTelefonoArgentina = (input: string) => {
    const digits = input.replace(/\D/g, "");
    if (digits.length < 10) return null;
    return `+549${digits}`;
  };

  const getModalTitle = () => {
    switch (modalOpen) {
      case "pagados":
        return "Detalles de Pagos Recaudados";
      case "pendientes":
        return "Detalles de Pagos Pendientes";
      case "vencidos":
        return "Detalles de Pagos Vencidos";
      case "sinTelefono":
        return "Usuarios sin teléfono";
      default:
        return "";
    }
  };

  // ACCIÑ“N: Guardar teléfono (Lógica del primer código)
  const handleSaveTelefono = async (user: UsuarioSinTelefono) => {
    const telefonoInput = telefonos[user.id];

    if (!telefonoInput) {
      toast.error("Ingrese un teléfono");
      return;
    }

    const telefonoFormateado = formatTelefonoArgentina(telefonoInput);

    if (!telefonoFormateado) {
      toast.error("Formato inválido. Ej: 3511234567");
      return;
    }

    startTransition(async () => {
      setSavingId(user.id);

      const res = await updateTelefonoUsuario({
        usuarioId: user.id,
        telefono: telefonoFormateado,
      });

      if (res.success) {
        toast.success("Teléfono guardado");
        // Opcional: actualizar lista local o refrescar datos si es necesario
      } else {
        toast.error("Error al guardar");
      }

      setSavingId(null);
    });
  };

  return (
    <>
      {/* MODAL */}
      <Dialog open={!!modalOpen} onOpenChange={() => setModalOpen(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{getModalTitle()}</DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[420px] pr-4">
            {activeList.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground py-10">
                No hay datos para mostrar.
              </div>
            ) : (
              <div className="space-y-3 py-2">
                {activeList.map((item: any) => {
                  // RENDERIZADO: Usuarios sin teléfono
                  if (modalOpen === "sinTelefono") {
                    const user = item as UsuarioSinTelefono;
                    return (
                      <div
                        key={user.id}
                        className="flex items-center justify-between border rounded-lg p-3"
                      >
                        <div>
                          <p className="font-medium text-sm">
                            {user.nombre} {user.apellido}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {user.documento || "Sin documento"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            placeholder="3511234567"
                            className="border rounded px-2 py-1 text-sm w-32"
                            value={telefonos[user.id] || ""}
                            onChange={(e) =>
                              setTelefonos((prev) => ({
                                ...prev,
                                [user.id]: e.target.value,
                              }))
                            }
                          />
                          <button
                            onClick={() => handleSaveTelefono(user)}
                            className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded text-xs hover:bg-green-700 transition-colors"
                          >
                            {savingId === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save size={14} />
                            )}
                            Guardar
                          </button>
                        </div>
                      </div>
                    );
                  }

                  // RENDERIZADO: Pagos (Pagados, Pendientes, Vencidos)
                  const pago = item as PaymentDetailRow;

                  return (
                    <div
                      key={pago.id}
                      className="flex items-center justify-between border rounded-lg p-3"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {pago.usuarioNombre} {pago.usuarioApellido}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {pago.documento || "Sin documento"}
                          </span>
                          {/* Mostrar fecha si existe y es pendiente/vencido */}
                          {(modalOpen === "pendientes" ||
                            modalOpen === "vencidos") &&
                            pago.fechaVencimiento && (
                              <span className="text-xs text-muted-foreground">
                                ’¢ {formatDate(pago.fechaVencimiento)}
                              </span>
                            )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-lg font-bold ${
                            modalOpen === "pagados"
                              ? "text-green-600"
                              : modalOpen === "vencidos"
                                ? "text-red-600"
                                : "text-amber-600"
                          }`}
                        >
                          {formatCurrency(pago.monto)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
