"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusIcon, TrashIcon, Save, Loader2 } from "lucide-react";

import { AlertMessage } from "@/components/admin/tarifas/ui/alert-message";
import { useNotifications } from "@/components/admin/tarifas/components/use-notifications";
import { crearConfiguracionTarifa } from "@/actions/users/admin/tarifas/crearTarifa";
import { getNameTarifas } from "@/01-actions/admin/tarifas/get-name-tarifas";
import { useQuery } from "@tanstack/react-query";

type TipoConfiguracionTarifa = "FIJA_MENSUAL" | "DINAMICA_POR_FECHA_INGRESO";

interface RangoTarifaForm {
  tempId: string;
  nombre: string;
  diaInicio: number | "";
  diaFin: number | "";
  monto: number | "";
}

interface DinamicaTarifaForm {
  tempId: string;
  nombre: string;
  montoBase: number | "";
  diasGracia: number | "";
  montoRecargo: number | "";
}

interface CrearTarifaFormProps {
  administradorId: string;
  onSuccess?: () => void;
}

interface FormAlert {
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
}

export function CrearTarifaForm({
  administradorId,
  onSuccess,
}: CrearTarifaFormProps) {
  const data = useQuery({
    queryKey: ["nombreTarifa"],
    queryFn: getNameTarifas,
  });

  const [tipoConfiguracion, setTipoConfiguracion] =
    useState<TipoConfiguracionTarifa>("FIJA_MENSUAL");

  const [rangos, setRangos] = useState<RangoTarifaForm[]>([
    {
      tempId: crypto.randomUUID(),
      nombre: "",
      diaInicio: "",
      diaFin: "",
      monto: "",
    },
  ]);

  const [dinamicas, setDinamicas] = useState<DinamicaTarifaForm[]>([
    {
      tempId: crypto.randomUUID(),
      nombre: "",
      montoBase: "",
      diasGracia: "",
      montoRecargo: "",
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<FormAlert | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { showSuccess, showError } = useNotifications();

  // Validaciones
  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (tipoConfiguracion === "FIJA_MENSUAL") {
      if (rangos.length === 0)
        errors.push("Debe agregar al menos un rango de tarifa");

      rangos.forEach((rango, index) => {
        if (
          !rango.nombre ||
          !rango.diaInicio ||
          !rango.diaFin ||
          !rango.monto
        ) {
          errors.push(`Rango ${index + 1}: Todos los campos son obligatorios`);
        } else {
          if (Number(rango.diaInicio) > Number(rango.diaFin)) {
            errors.push(
              `Rango ${index + 1}: Día inicio no puede ser mayor al día fin`
            );
          }
          if (Number(rango.monto) <= 0) {
            errors.push(`Rango ${index + 1}: Monto debe ser mayor a 0`);
          }
        }
      });

      // Verificar solapamientos
      for (let i = 0; i < rangos.length; i++) {
        for (let j = i + 1; j < rangos.length; j++) {
          const a = rangos[i];
          const b = rangos[j];
          if (
            Number(a.diaInicio) <= Number(b.diaFin) &&
            Number(a.diaFin) >= Number(b.diaInicio)
          ) {
            errors.push(`Los rangos ${i + 1} y ${j + 1} se superponen`);
          }
        }
      }
    } else {
      if (dinamicas.length === 0)
        errors.push("Debe agregar al menos una tarifa dinámica");

      dinamicas.forEach((d, index) => {
        if (!d.nombre || !d.montoBase || !d.diasGracia || !d.montoRecargo) {
          errors.push(`Tarifa ${index + 1}: Todos los campos son obligatorios`);
        } else {
          if (Number(d.montoBase) <= 0)
            errors.push(`Tarifa ${index + 1}: Monto base debe ser > 0`);
          if (Number(d.diasGracia) < 0)
            errors.push(`Tarifa ${index + 1}: Días de gracia >= 0`);
          if (Number(d.montoRecargo) <= Number(d.montoBase))
            errors.push(
              `Tarifa ${index + 1}: Monto con recargo debe ser mayor al monto base`
            );
        }
      });
    }

    return errors;
  };

  // Funciones para manejar rangos
  const handleAddRango = () => {
    setRangos([
      ...rangos,
      {
        tempId: crypto.randomUUID(),
        nombre: "",
        diaInicio: "",
        diaFin: "",
        monto: "",
      },
    ]);
  };

  const handleRemoveRango = (tempId: string) =>
    setRangos(rangos.filter((r) => r.tempId !== tempId));

  const handleRangoChange = (
    tempId: string,
    field: keyof Omit<RangoTarifaForm, "tempId">,
    value: string
  ) => {
    setRangos(
      rangos.map((r) =>
        r.tempId === tempId
          ? { ...r, [field]: field === "nombre" ? value : Number(value) }
          : r
      )
    );
  };

  // Funciones para manejar dinámicas
  const handleAddDinamica = () => {
    setDinamicas([
      ...dinamicas,
      {
        tempId: crypto.randomUUID(),
        nombre: "",
        montoBase: "",
        diasGracia: "",
        montoRecargo: "",
      },
    ]);
  };

  const handleRemoveDinamica = (tempId: string) =>
    setDinamicas(dinamicas.filter((d) => d.tempId !== tempId));

  const handleDinamicaChange = (
    tempId: string,
    field: keyof Omit<DinamicaTarifaForm, "tempId">,
    value: string
  ) => {
    setDinamicas(
      dinamicas.map((d) =>
        d.tempId === tempId
          ? { ...d, [field]: field === "nombre" ? value : Number(value) }
          : d
      )
    );
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);
    setValidationErrors([]);

    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      setAlert({
        type: "error",
        title: "Errores de validación",
        description: "Corrige los errores antes de continuar",
      });
      showError("Formulario inválido", "Revisa los campos marcados en rojo");
      return;
    }

    setIsLoading(true);
    try {
      const configData = {
        tipoConfiguracion,
        administradorId,
        rangos:
          tipoConfiguracion === "FIJA_MENSUAL"
            ? rangos.map((r) => ({
                nombre: r.nombre,
                diaInicio: Number(r.diaInicio),
                diaFin: Number(r.diaFin),
                monto: Number(r.monto),
              }))
            : [],
        dinamicas:
          tipoConfiguracion === "DINAMICA_POR_FECHA_INGRESO"
            ? dinamicas.map((d) => ({
                nombre: d.nombre,
                montoBase: Number(d.montoBase),
                diasGracia: Number(d.diasGracia),
                montoRecargo: Number(d.montoRecargo),
              }))
            : [],
      };

      const result = await crearConfiguracionTarifa(configData);

      if (result.ok) {
        setAlert({
          type: "success",
          title: "Configuración creada exitosamente",
        });
        showSuccess(
          "Configuración creada",
          "La configuración de tarifas se ha creado correctamente"
        );
        setTimeout(() => onSuccess?.(), 1500);
      } else {
        setAlert({
          type: "error",
          title: "Error al crear la configuración",
          description: "Intenta nuevamente",
        });
        showError("Error al crear", "No se pudo crear la configuración");
      }
    } catch (error) {
      setAlert({
        type: "error",
        title: "Error inesperado",
        description: "Intenta nuevamente",
      });
      showError("Error inesperado", "Intenta nuevamente");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            Crear Nueva Configuración de Tarifas
          </CardTitle>
          <CardDescription>
            Define cómo se calcularán las cuotas para tus usuarios.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {alert && (
            <AlertMessage
              type={alert.type}
              title={alert.title}
              description={alert.description}
              className="mb-4"
            />
          )}
          {validationErrors.length > 0 &&
            validationErrors.map((err, i) => (
              <AlertMessage
                key={i}
                type="error"
                title={err}
                className="text-sm"
              />
            ))}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label
                htmlFor="tipoConfiguracion"
                className="text-base font-medium"
              >
                Tipo de Configuración
              </Label>
              <Select
                value={tipoConfiguracion}
                onValueChange={(v) =>
                  setTipoConfiguracion(v as TipoConfiguracionTarifa)
                }
                disabled={isLoading}
              >
                <SelectTrigger id="tipoConfiguracion" className="w-full">
                  <SelectValue placeholder="Selecciona un tipo de configuración" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIJA_MENSUAL">
                    Fija Mensual (por rango de días)
                  </SelectItem>
                  <SelectItem value="DINAMICA_POR_FECHA_INGRESO">
                    Dinámica (por fecha de ingreso)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rangos Fijos */}
            {tipoConfiguracion === "FIJA_MENSUAL" && (
              <div className="space-y-6 border border-gray-200 p-6 rounded-lg bg-gray-50/50">
                <h3 className="text-lg font-semibold text-gray-900">
                  Rangos de Tarifa Fija Mensual
                </h3>
                {rangos.map((r, i) => (
                  <div
                    key={r.tempId}
                    className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-gray-700">
                        Rango {i + 1}
                      </h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveRango(r.tempId)}
                        disabled={rangos.length === 1 || isLoading}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`nombre-${r.tempId}`}>Nombre</Label>
                        <Input
                          id={`nombre-${r.tempId}`}
                          type="text"
                          value={r.nombre}
                          onChange={(e) =>
                            handleRangoChange(
                              r.tempId,
                              "nombre",
                              e.target.value
                            )
                          }
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`diaInicio-${r.tempId}`}>
                          Día Inicio
                        </Label>
                        <Input
                          id={`diaInicio-${r.tempId}`}
                          type="number"
                          value={r.diaInicio}
                          onChange={(e) =>
                            handleRangoChange(
                              r.tempId,
                              "diaInicio",
                              e.target.value
                            )
                          }
                          min={1}
                          max={31}
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`diaFin-${r.tempId}`}>Día Fin</Label>
                        <Input
                          id={`diaFin-${r.tempId}`}
                          type="number"
                          value={r.diaFin}
                          onChange={(e) =>
                            handleRangoChange(
                              r.tempId,
                              "diaFin",
                              e.target.value
                            )
                          }
                          min={1}
                          max={31}
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`monto-${r.tempId}`}>Monto ($)</Label>
                        <Input
                          id={`monto-${r.tempId}`}
                          type="number"
                          step="0.01"
                          value={r.monto}
                          onChange={(e) =>
                            handleRangoChange(r.tempId, "monto", e.target.value)
                          }
                          disabled={isLoading}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddRango}
                  disabled={isLoading}
                  className="w-full border-dashed border-2 hover:bg-gray-50 bg-transparent"
                >
                  <PlusIcon className="h-4 w-4 mr-2" /> Agregar Nuevo Rango
                </Button>
              </div>
            )}

            {/* Tarifas Dinámicas */}
            {tipoConfiguracion === "DINAMICA_POR_FECHA_INGRESO" && (
              <div className="space-y-6 border border-gray-200 p-6 rounded-lg bg-gray-50/50">
                <h3 className="text-lg font-semibold text-gray-900">
                  Tarifas Dinámicas
                </h3>
                {dinamicas.map((d, i) => (
                  <div
                    key={d.tempId}
                    className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-gray-700">
                        Tarifa {i + 1}
                      </h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveDinamica(d.tempId)}
                        disabled={dinamicas.length === 1 || isLoading}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`nombre-${d.tempId}`}>Nombre</Label>
                        <Input
                          id={`nombre-${d.tempId}`}
                          type="text"
                          value={d.nombre}
                          onChange={(e) =>
                            handleDinamicaChange(
                              d.tempId,
                              "nombre",
                              e.target.value
                            )
                          }
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`montoBase-${d.tempId}`}>
                          Monto Base ($)
                        </Label>
                        <Input
                          id={`montoBase-${d.tempId}`}
                          type="number"
                          step="0.01"
                          value={d.montoBase}
                          onChange={(e) =>
                            handleDinamicaChange(
                              d.tempId,
                              "montoBase",
                              e.target.value
                            )
                          }
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`diasGracia-${d.tempId}`}>
                          Días de Gracia
                        </Label>
                        <Input
                          id={`diasGracia-${d.tempId}`}
                          type="number"
                          value={d.diasGracia}
                          onChange={(e) =>
                            handleDinamicaChange(
                              d.tempId,
                              "diasGracia",
                              e.target.value
                            )
                          }
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`montoRecargo-${d.tempId}`}>
                          Monto con Recargo ($)
                        </Label>
                        <Input
                          id={`montoRecargo-${d.tempId}`}
                          type="number"
                          step="0.01"
                          value={d.montoRecargo}
                          onChange={(e) =>
                            handleDinamicaChange(
                              d.tempId,
                              "montoRecargo",
                              e.target.value
                            )
                          }
                          disabled={isLoading}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddDinamica}
                  disabled={isLoading}
                  className="w-full border-dashed border-2 hover:bg-gray-50 bg-transparent"
                >
                  <PlusIcon className="h-4 w-4 mr-2" /> Agregar Nueva Tarifa
                  Dinámica
                </Button>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="animate-spin h-4 w-4 mr-2 inline" />
                ) : (
                  <Save className="w-4 h-4 mr-2 inline" />
                )}
                Crear Configuración
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
