"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Save, Loader2 } from "lucide-react";

import type { TipoConfiguracionTarifa } from "@prisma/client";

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

interface TariffModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: TariffData) => Promise<void>;
  editingTariff?: TariffData | null;
  tipoConfiguracion: TipoConfiguracionTarifa;
  onTipoChange?: (tipo: TipoConfiguracionTarifa) => void;
  showTipoSelector?: boolean;
}

export function TariffModal({
  open,
  onClose,
  onSave,
  editingTariff,
  tipoConfiguracion,
  onTipoChange,
  showTipoSelector = false,
}: TariffModalProps) {
  const [formData, setFormData] = useState<TariffData>({
    nombre: "",
    diaInicio: undefined,
    diaFin: undefined,
    monto: undefined,
    montoBase: undefined,
    diasGracia: undefined,
    montoRecargo: undefined,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const isFijaMensual = tipoConfiguracion === "FIJA_MENSUAL";
  const isEditing = !!editingTariff;

  useEffect(() => {
    if (editingTariff) {
      setFormData(editingTariff);
    } else {
      setFormData({
        nombre: "",
        diaInicio: undefined,
        diaFin: undefined,
        monto: undefined,
        montoBase: undefined,
        diasGracia: undefined,
        montoRecargo: undefined,
      });
    }
    setErrors([]);
  }, [editingTariff, open]);

  const validateForm = (): string[] => {
    const newErrors: string[] = [];

    if (!formData.nombre.trim()) {
      newErrors.push("El nombre es obligatorio");
    }

    if (isFijaMensual) {
      if (
        !formData.diaInicio ||
        formData.diaInicio < 1 ||
        formData.diaInicio > 31
      ) {
        newErrors.push("Día inicio debe estar entre 1 y 31");
      }
      if (!formData.diaFin || formData.diaFin < 1 || formData.diaFin > 31) {
        newErrors.push("Día fin debe estar entre 1 y 31");
      }
      if (
        formData.diaInicio &&
        formData.diaFin &&
        formData.diaInicio > formData.diaFin
      ) {
        newErrors.push("Día inicio no puede ser mayor al día fin");
      }
      if (!formData.monto || formData.monto <= 0) {
        newErrors.push("El monto debe ser mayor a 0");
      }
    } else {
      if (!formData.montoBase || formData.montoBase <= 0) {
        newErrors.push("El monto base debe ser mayor a 0");
      }
      if (formData.diasGracia === undefined || formData.diasGracia < 0) {
        newErrors.push("Los días de gracia deben ser 0 o mayor");
      }
      if (!formData.montoRecargo || formData.montoRecargo <= 0) {
        newErrors.push("El monto con recargo debe ser mayor a 0");
      }
      if (
        formData.montoBase &&
        formData.montoRecargo &&
        formData.montoRecargo <= formData.montoBase
      ) {
        newErrors.push("El monto con recargo debe ser mayor al monto base");
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors([]);

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      setErrors(["Error al guardar la tarifa. Intenta nuevamente."]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Tarifa" : "Nueva Tarifa"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los datos de la tarifa existente"
              : "Completa los datos para crear una nueva tarifa"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {showTipoSelector && onTipoChange && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Tipo de Configuración
              </Label>
              <RadioGroup
                value={tipoConfiguracion}
                onValueChange={(value) =>
                  onTipoChange(value as TipoConfiguracionTarifa)
                }
                className="grid grid-cols-1 gap-3"
              >
                <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50">
                  <RadioGroupItem value="FIJA_MENSUAL" id="fija" />
                  <Label htmlFor="fija" className="flex-1 cursor-pointer">
                    <div className="font-medium">Fija Mensual</div>
                    <div className="text-sm text-gray-500">
                      Por rango de días del mes
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50">
                  <RadioGroupItem
                    value="DINAMICA_POR_FECHA_INGRESO"
                    id="dinamica"
                  />
                  <Label htmlFor="dinamica" className="flex-1 cursor-pointer">
                    <div className="font-medium">Dinámica</div>
                    <div className="text-sm text-gray-500">
                      Por fecha de ingreso del usuario
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre de la Tarifa</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              placeholder="Ej: Cuota Mensual, Tarifa Estudiante..."
              disabled={isLoading}
            />
          </div>

          {isFijaMensual ? (
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="diaInicio">Día Inicio</Label>
                <Input
                  id="diaInicio"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.diaInicio || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      diaInicio: Number(e.target.value),
                    })
                  }
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diaFin">Día Fin</Label>
                <Input
                  id="diaFin"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.diaFin || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, diaFin: Number(e.target.value) })
                  }
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monto">Monto ($)</Label>
                <Input
                  id="monto"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.monto || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, monto: Number(e.target.value) })
                  }
                  disabled={isLoading}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="montoBase">Monto Base ($)</Label>
                <Input
                  id="montoBase"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.montoBase || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      montoBase: Number(e.target.value),
                    })
                  }
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diasGracia">Días Gracia</Label>
                <Input
                  id="diasGracia"
                  type="number"
                  min="0"
                  value={formData.diasGracia || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      diasGracia: Number(e.target.value),
                    })
                  }
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="montoRecargo">Monto Recargo ($)</Label>
                <Input
                  id="montoRecargo"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.montoRecargo || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      montoRecargo: Number(e.target.value),
                    })
                  }
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <ul className="text-sm text-red-600 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isEditing ? "Actualizar" : "Crear"} Tarifa
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
