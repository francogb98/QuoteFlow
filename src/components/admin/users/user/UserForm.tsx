"use client";

import {
  User,
  Hash,
  Calendar,
  Shield,
  Phone,
  UserCheck,
  Save,
  Loader2,
  Mail,
  DollarSign,
  CalendarDays,
} from "lucide-react";
import { StatusChangeAlert } from "./StatusChangeAlert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
    <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
      <div className="bg-secondary p-6 border-b border-border">
        <h2 className="text-xl font-semibold text-card-foreground flex items-center">
          <UserCheck className="w-5 h-5 mr-2 text-primary" />
          Información Personal
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Actualiza los datos del usuario
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Nombre */}
          <div>
            <Label htmlFor="nombre" className="mb-2 flex items-center gap-1">
              <User className="w-4 h-4" />
              Nombre
            </Label>
            <Input
              type="text"
              id="nombre"
              name="nombre"
              value={formData?.nombre || ""}
              onChange={handleChange}
              placeholder="Ingrese el nombre"
            />
          </div>

          {/* Apellido */}
          <div>
            <Label htmlFor="apellido" className="mb-2 flex items-center gap-1">
              <User className="w-4 h-4" />
              Apellido
            </Label>
            <Input
              type="text"
              id="apellido"
              name="apellido"
              value={formData?.apellido || ""}
              onChange={handleChange}
              placeholder="Ingrese el apellido"
            />
          </div>

          {/* Documento */}
          <div>
            <Label htmlFor="documento" className="mb-2 flex items-center gap-1">
              <Hash className="w-4 h-4" />
              Documento
            </Label>
            <Input
              type="text"
              id="documento"
              name="documento"
              value={formData?.documento || ""}
              onChange={handleChange}
              placeholder="Ej: 12345678"
            />
          </div>

          {/* Edad */}
          <div>
            <Label htmlFor="edad" className="mb-2 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Edad
            </Label>
            <Input
              type="number"
              id="edad"
              name="edad"
              value={formData?.edad || ""}
              onChange={handleChange}
              placeholder="Ej: 25"
            />
          </div>

          {/* Teléfono */}
          <div>
            <Label htmlFor="telefono" className="mb-2 flex items-center gap-1">
              <Phone className="w-4 h-4" />
              Teléfono
            </Label>
            <Input
              type="text"
              id="telefono"
              name="telefono"
              value={formData?.telefono || ""}
              onChange={handleChange}
              placeholder="Ej: +54 11 1234-5678"
            />
          </div>

          {/* Correo Electrónico */}
          <div>
            <Label htmlFor="email" className="mb-2 flex items-center gap-1">
              <Mail className="w-4 h-4" />
              Correo Electrónico{" "}
              <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData?.email || ""}
              onChange={handleChange}
              placeholder="Ej: usuario@correo.com"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Este correo se usará para enviar notificaciones de pago y
              recordatorios.
            </p>
          </div>

          {/* Estado del Usuario */}
          <div>
            <Label htmlFor="estado" className="mb-2 flex items-center gap-1">
              <Shield className="w-4 h-4" />
              Estado del Usuario
            </Label>
            <Select
              value={formData?.estado || "ACTIVO"}
              onValueChange={(value) => {
                handleChange({ target: { name: "estado", value } });
              }}
            >
              <SelectTrigger id="estado" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVO">Activo</SelectItem>
                <SelectItem value="INACTIVO">Inactivo</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Los usuarios inactivos no podrán acceder al sistema
            </p>
          </div>

          <div>
            <Label htmlFor="fechaInicioMembresia" className="mb-2 flex items-center gap-1">
              <CalendarDays className="w-4 h-4" />
              Fecha de Inicio de Membresía
            </Label>
            <Input
              type="date"
              id="fechaInicioMembresia"
              name="fechaInicioMembresia"
              value={formatDateForArgentina(formData?.fechaInicioMembresia)}
              onChange={handleChange}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Fecha en que el usuario comenzó su membresía (zona horaria de
              Argentina)
            </p>
          </div>

          {/* Tarifa */}
          <div>
            <Label htmlFor="tarifa" className="mb-2 flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              Tarifa
            </Label>
            <Select
              value={formData?.tarifa ?? tarifaActual ?? ""}
              onValueChange={(value) => {
                handleChange({ target: { name: "tarifa", value } });
              }}
            >
              <SelectTrigger id="tarifa" className="w-full">
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
              <p className="mt-1 text-xs text-primary">
                Tarifa será actualizada al guardar los cambios
              </p>
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
            className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
