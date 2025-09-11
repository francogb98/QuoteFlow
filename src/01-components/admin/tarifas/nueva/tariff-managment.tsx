"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, CreditCard } from "lucide-react";
import { TariffTable } from "./tariff-table";
import { TariffModal } from "./tariff-modal";
import { toast } from "sonner"; // Asegúrate de tener sonner instalado para las notificaciones

import type {
  TipoConfiguracionTarifa,
  ModeloDeCobro,
  ConfiguracionTarifa,
  RangoTarifa,
  ConfiguracionDinamicaTarifa,
} from "@prisma/client";
import { InfoBanner } from "../InfoBanner";
import { crearConfiguracionTarifa } from "@/actions/users/admin/tarifas/crearTarifa";
import { actualizarConfiguracionTarifa } from "@/actions/users/admin/tarifas/actualizarTarifa";
import { eliminarTarifa } from "@/actions/users/admin/tarifas/delete-tarifa";
import { TypeSwitchDialog } from "./TypeSwitchDialog";

// Importa las funciones del servidor

interface TariffData {
  id?: string;
  nombre: string;
  diaInicio?: number;
  diaFin?: number;
  monto?: number;
  montoBase?: number;
  diasGracia?: number;
  montoRecargo?: number;
}

interface TariffManagementProps {
  user: {
    id: string;
    modeloDeCobro?: ModeloDeCobro | null;
    configuracionTarifa?:
      | (ConfiguracionTarifa & {
          rangos: RangoTarifa[];
          dinamicas: ConfiguracionDinamicaTarifa[];
        })
      | null;
  };
}

export function TariffManagement({ user }: TariffManagementProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTariff, setEditingTariff] = useState<TariffData | null>(null);
  const [showConfigSelector, setShowConfigSelector] = useState(false);
  const [showTypeSwitchDialog, setShowTypeSwitchDialog] = useState(false); // <--- NUEVO ESTADO

  const configuracion = user.configuracionTarifa;
  const hasConfiguracion = !!configuracion;
  const tipoActual = configuracion?.tipoConfiguracion || "FIJA_MENSUAL";

  const tarifasActuales: TariffData[] = (
    tipoActual === "FIJA_MENSUAL"
      ? configuracion?.rangos || []
      : configuracion?.dinamicas || []
  ).filter((t) => t.id) as TariffData[];

  const handleCreateNew = () => {
    if (!hasConfiguracion) {
      setShowConfigSelector(true);
    } else {
      setShowConfigSelector(false);
    }
    setEditingTariff(null);
    setModalOpen(true);
  };

  const handleEdit = (tarifa: TariffData) => {
    setEditingTariff(tarifa);
    setShowConfigSelector(false);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const result = await eliminarTarifa(id, tipoActual);
    if (result.ok) {
      toast.success("Tarifa eliminada con éxito");
    } else {
      toast.error(result.error || "Hubo un error al eliminar la tarifa.");
    }
  };

  const handleSave = async (data: TariffData) => {
    let result;
    const isNewTariff = !data.id;

    if (!hasConfiguracion) {
      // Create new tariff configuration
      const payload =
        tipoActual === "FIJA_MENSUAL"
          ? {
              tipoConfiguracion: tipoActual,
              rangos: [data],
              dinamicas: [],
            }
          : {
              tipoConfiguracion: tipoActual,
              rangos: [],
              dinamicas: [data],
            };
      result = await crearConfiguracionTarifa(payload);
    } else {
      // Update existing configuration
      const existingTariffs = tarifasActuales.filter((t) => t.id !== data.id);
      const updatedTariffs = isNewTariff
        ? [...existingTariffs, data]
        : [
            ...existingTariffs,
            { ...data, id: data.id }, // ensure id is not lost on update
          ];

      const payload =
        tipoActual === "FIJA_MENSUAL"
          ? {
              id: configuracion.id,
              tipoConfiguracion: tipoActual,
              rangos: updatedTariffs,
              dinamicas: [],
            }
          : {
              id: configuracion.id,
              tipoConfiguracion: tipoActual,
              rangos: [],
              dinamicas: updatedTariffs,
            };

      result = await actualizarConfiguracionTarifa(payload);
    }

    if (result.ok) {
      toast.success("Tarifa guardada con éxito");
    } else {
      toast.error(result.error);
    }
  };

  const handleTipoChange = async (newTipo: TipoConfiguracionTarifa) => {
    if (hasConfiguracion) {
      const result = await actualizarConfiguracionTarifa({
        id: configuracion.id,
        tipoConfiguracion: newTipo,
        rangos: [],
        dinamicas: [],
      });
      if (result.ok) {
        toast.success("Tipo de configuración actualizado");
        setModalOpen(false); // Close modal after changing type
      } else {
        toast.error(result.error);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center space-y-2 sm:space-y-4">
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">
          Gestión de Tarifas
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
          Configura y administra las tarifas de tu sistema de manera simple y
          eficiente.
        </p>
      </div>

      {/* Info Banner para MercadoPago */}
      {user.modeloDeCobro === "MERCADOPAGO" && <InfoBanner />}

      {/* Estado de Configuración */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-xl">
                  Estado de Configuración
                </CardTitle>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  {hasConfiguracion
                    ? "Tu sistema de tarifas está configurado y activo"
                    : "No tienes configuración de tarifas activa"}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
              {hasConfiguracion ? (
                <div className="flex items-end sm:items-center gap-2">
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800 text-xs sm:text-sm"
                  >
                    Configurado
                  </Badge>
                  <div className="flex border rounded-md overflow-hidden">
                    <Button
                      onClick={() => {
                        if (tipoActual !== "FIJA_MENSUAL") {
                          setShowTypeSwitchDialog(true);
                        }
                      }}
                      variant="ghost"
                      size="sm"
                      className={`rounded-none text-xs sm:text-sm ${
                        tipoActual === "FIJA_MENSUAL"
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      Fija Mensual
                    </Button>
                    <Button
                      onClick={() => {
                        if (tipoActual !== "DINAMICA_POR_FECHA_INGRESO") {
                          setShowTypeSwitchDialog(true);
                        }
                      }}
                      variant="ghost"
                      size="sm"
                      className={`rounded-none text-xs sm:text-sm ${
                        tipoActual === "DINAMICA_POR_FECHA_INGRESO"
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      Dinámica
                    </Button>
                  </div>
                </div>
              ) : (
                <Badge
                  variant="secondary"
                  className="bg-yellow-100 text-yellow-800 text-xs sm:text-sm"
                >
                  Sin Configurar
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        {hasConfiguracion && (
          <CardContent>
            <TariffTable
              tarifas={tarifasActuales}
              tipo={tipoActual}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCreate={handleCreateNew}
            />
          </CardContent>
        )}

        {!hasConfiguracion && (
          <CardContent>
            <div className="text-center py-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                Configura tu Sistema de Tarifas
              </h3>
              <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
                Elige el tipo de configuración que mejor se adapte a tu negocio
                y comienza a gestionar tus tarifas.
              </p>
              <Button onClick={handleCreateNew} size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Configurar Tarifas
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Modal para Crear/Editar */}
      <TariffModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTariff(null);
          setShowConfigSelector(false);
        }}
        onSave={handleSave}
        editingTariff={editingTariff}
        tipoConfiguracion={tipoActual}
        onTipoChange={handleTipoChange}
        showTipoSelector={showConfigSelector}
      />
      {hasConfiguracion && (
        <TypeSwitchDialog
          open={showTypeSwitchDialog}
          onClose={() => setShowTypeSwitchDialog(false)}
          onConfirm={(newType) => {
            handleTipoChange(newType);
            setShowTypeSwitchDialog(false);
          }}
          currentType={tipoActual}
        />
      )}
    </div>
  );
}
