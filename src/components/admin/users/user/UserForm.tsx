"use client";

import {
  User, Hash, Calendar, Shield, Phone, UserCheck, Save, Loader2, Mail, DollarSign, CalendarDays,
} from "lucide-react";
import { StatusChangeAlert } from "./StatusChangeAlert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface UserFormProps {
  formData: any;
  originalData: any;
  handleChange: (e: any) => void;
  handleSubmit: (e: any) => void;
  isLoading: boolean;
  tarifasDisponibles: any;
  tarifaActual: any;
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

export function UserForm({
  formData,
  originalData,
  handleChange,
  handleSubmit,
  isLoading,
  tarifasDisponibles,
  tarifaActual,
}: UserFormProps) {
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
        {/* Nombre */}
        <div>
          <Label htmlFor="nombre" className="text-[11px] font-medium flex items-center gap-1 mb-1">
            <User className="w-3 h-3" />Nombre
          </Label>
          <Input
            type="text"
            id="nombre"
            name="nombre"
            value={formData?.nombre || ""}
            onChange={handleChange}
            placeholder="Nombre"
            className="h-9 text-xs"
          />
        </div>

        {/* Apellido */}
        <div>
          <Label htmlFor="apellido" className="text-[11px] font-medium flex items-center gap-1 mb-1">
            <User className="w-3 h-3" />Apellido
          </Label>
          <Input
            type="text"
            id="apellido"
            name="apellido"
            value={formData?.apellido || ""}
            onChange={handleChange}
            placeholder="Apellido"
            className="h-9 text-xs"
          />
        </div>

        {/* Documento */}
        <div>
          <Label htmlFor="documento" className="text-[11px] font-medium flex items-center gap-1 mb-1">
            <Hash className="w-3 h-3" />Documento
          </Label>
          <Input
            type="text"
            id="documento"
            name="documento"
            value={formData?.documento || ""}
            onChange={handleChange}
            placeholder="DNI"
            className="h-9 text-xs"
          />
        </div>

        {/* Edad */}
        <div>
          <Label htmlFor="edad" className="text-[11px] font-medium flex items-center gap-1 mb-1">
            <Calendar className="w-3 h-3" />Edad
          </Label>
          <Input
            type="number"
            id="edad"
            name="edad"
            value={formData?.edad || ""}
            onChange={handleChange}
            placeholder="Edad"
            className="h-9 text-xs"
          />
        </div>

        {/* Teléfono */}
        <div>
          <Label htmlFor="telefono" className="text-[11px] font-medium flex items-center gap-1 mb-1">
            <Phone className="w-3 h-3" />Teléfono
          </Label>
          <Input
            type="text"
            id="telefono"
            name="telefono"
            value={formData?.telefono || ""}
            onChange={handleChange}
            placeholder="+54 11 1234-5678"
            className="h-9 text-xs"
          />
        </div>

        {/* Correo */}
        <div>
          <Label htmlFor="email" className="text-[11px] font-medium flex items-center gap-1 mb-1">
            <Mail className="w-3 h-3" />Email <span className="text-muted-foreground">(opc.)</span>
          </Label>
          <Input
            type="email"
            id="email"
            name="email"
            value={formData?.email || ""}
            onChange={handleChange}
            placeholder="correo@ejemplo.com"
            className="h-9 text-xs"
          />
        </div>

        {/* Estado */}
        <div>
          <Label htmlFor="estado" className="text-[11px] font-medium flex items-center gap-1 mb-1">
            <Shield className="w-3 h-3" />Estado
          </Label>
          <Select
            value={formData?.estado || "ACTIVO"}
            onValueChange={(value) => handleChange({ target: { name: "estado", value } })}
          >
            <SelectTrigger id="estado" className="h-9 w-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVO">Activo</SelectItem>
              <SelectItem value="INACTIVO">Inactivo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Fecha Inicio Membresía */}
        <div>
          <Label htmlFor="fechaInicioMembresia" className="text-[11px] font-medium flex items-center gap-1 mb-1">
            <CalendarDays className="w-3 h-3" />Inicio Membresía
          </Label>
          <Input
            type="date"
            id="fechaInicioMembresia"
            name="fechaInicioMembresia"
            value={formatDateForArgentina(formData?.fechaInicioMembresia)}
            onChange={handleChange}
            className="h-9 text-xs"
          />
        </div>

        {/* Tarifa */}
        <div className="col-span-2">
          <Label htmlFor="tarifa" className="text-[11px] font-medium flex items-center gap-1 mb-1">
            <DollarSign className="w-3 h-3" />Tarifa
          </Label>
          <Select
            value={formData?.tarifa ?? tarifaActual ?? ""}
            onValueChange={(value) => handleChange({ target: { name: "tarifa", value } })}
          >
            <SelectTrigger id="tarifa" className="h-9 w-full text-xs">
              <SelectValue placeholder="Seleccionar tarifa" />
            </SelectTrigger>
            <SelectContent>
              {tarifasDisponibles?.map((tarifa: any) => (
                <SelectItem key={tarifa.id} value={tarifa.id}>
                  {tarifa.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formData?.tarifa && formData.tarifa !== tarifaActual && (
            <p className="mt-0.5 text-[10px] text-primary">Se actualizará al guardar</p>
          )}
        </div>
      </div>

      <StatusChangeAlert
        currentStatus={originalData?.estado}
        newStatus={formData?.estado}
      />

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isLoading}
          size="sm"
          className="gap-1.5 h-8 text-xs bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {isLoading ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Guardando...</>
          ) : (
            <><Save className="w-3.5 h-3.5" /> Guardar Cambios</>
          )}
        </Button>
      </div>
    </form>
  );
}