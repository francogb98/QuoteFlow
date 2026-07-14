// components/perfil-tab.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Save,
  User,
  Hash,
  Phone,
  Mail,
  Shield,
  CalendarDays,
  DollarSign,
  Loader2,
  UserCheck,
} from "lucide-react";
import { Estado, TipoConfiguracionTarifa } from "@prisma/client";
import { StatusChangeAlert } from "@/components/admin";

interface PerfilTabProps {
  formData: any;
  originalData: any;
  tarifasDisponibles: any[];
  tipoConfiguracion?: TipoConfiguracionTarifa;
  onChange: (name: string, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const formatDateForArgentina = (date: Date | string | null): string => {
  if (!date) return "";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return "";
  const year = dateObj.getUTCFullYear();
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function PerfilTab({
  formData,
  originalData,
  tarifasDisponibles,
  tipoConfiguracion,
  onChange,
  onSubmit,
  isLoading,
}: PerfilTabProps) {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  const tarifaLabel =
    tipoConfiguracion === "DINAMICA_POR_FECHA_INGRESO"
      ? "Tarifa Dinámica"
      : "Rango de Tarifa";

  return (
    <ScrollArea className="h-[460px] pr-3">
      <form onSubmit={onSubmit} className="flex flex-col gap-6 pb-2">
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-purple-600" />
              Información Personal
            </h3>
            <p className="text-gray-500 text-sm">
              Actualiza los datos del usuario
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre, Apellido, Documento, Telefono, Email, Fecha, Estado (igual que antes) */}
            <div className="space-y-2">
              <Label htmlFor="nombre">
                <User className="w-4 h-4 inline mr-1" /> Nombre
              </Label>
              <Input
                id="nombre"
                name="nombre"
                value={formData?.nombre || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellido">
                <User className="w-4 h-4 inline mr-1" /> Apellido
              </Label>
              <Input
                id="apellido"
                name="apellido"
                value={formData?.apellido || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="documento">
                <Hash className="w-4 h-4 inline mr-1" /> Documento
              </Label>
              <Input
                id="documento"
                name="documento"
                value={formData?.documento || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">
                <Phone className="w-4 h-4 inline mr-1" /> Teléfono
              </Label>
              <Input
                id="telefono"
                name="telefono"
                value={formData?.telefono || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="w-4 h-4 inline mr-1" /> Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData?.email || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaInicioMembresia">
                <CalendarDays className="w-4 h-4 inline mr-1" /> Inicio
                Membresía
              </Label>
              <Input
                id="fechaInicioMembresia"
                name="fechaInicioMembresia"
                type="date"
                value={formatDateForArgentina(formData?.fechaInicioMembresia)}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">
                <Shield className="w-4 h-4 inline mr-1" /> Estado
              </Label>
              <Select
                value={formData?.estado || "ACTIVO"}
                onValueChange={(value) => onChange("estado", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Estado.ACTIVO}>Activo</SelectItem>
                  <SelectItem value={Estado.INACTIVO}>Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* SELECT DE TARIFA CORREGIDO */}
            <div className="space-y-2">
              <Label htmlFor="tarifa">
                <DollarSign className="w-4 h-4 inline mr-1" /> {tarifaLabel}
              </Label>
              <Select
                // Usamos "no-tarifa" si no hay ID, para evitar el error de empty string
                value={formData?.tarifa || "no-tarifa"}
                onValueChange={(value) => onChange("tarifa", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tarifa" />
                </SelectTrigger>
                <SelectContent>
                  {/* Usamos un valor válido que no sea vacío */}
                  <SelectItem value="no-tarifa">Sin Tarifa</SelectItem>
                  {tarifasDisponibles?.map((t: any) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.nombre}{" "}
                      {t.montoBase
                        ? `($${t.montoBase})`
                        : t.monto
                          ? `($${t.monto})`
                          : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6">
            <StatusChangeAlert
              currentStatus={originalData?.estado}
              newStatus={formData?.estado}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-emerald-500 to-green-600 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </form>
    </ScrollArea>
  );
}
