"use client";
import type React from "react";
import { useState, useEffect } from "react";
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
import { saveTariffConfiguration } from "@/actions/users/admin/configTarifas.action";

import { AlertMessage } from "@/components/admin/tarifas/ui/alert-message";
import { useNotifications } from "@/components/admin/tarifas/components/use-notifications";

type TipoConfiguracionTarifa = "FIJA_MENSUAL" | "DINAMICA_POR_FECHA_INGRESO";

interface RangoTarifaForm {
  id?: string;
  tempId: string;
  diaInicio: number | "";
  diaFin: number | "";
  monto: number | "";
}

interface ConfiguracionTarifaFormProps {
  existingConfig?: any;
  onSuccess?: () => void;
}

interface FormAlert {
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
}

export function ConfiguracionTarifaForm({
  existingConfig,
  onSuccess,
}: ConfiguracionTarifaFormProps) {
  const [tipoConfiguracion, setTipoConfiguracion] =
    useState<TipoConfiguracionTarifa>("FIJA_MENSUAL");
  const [rangos, setRangos] = useState<RangoTarifaForm[]>([
    { tempId: crypto.randomUUID(), diaInicio: "", diaFin: "", monto: "" },
  ]);
  const [montoBase, setMontoBase] = useState<number | "">("");
  const [diasGracia, setDiasGracia] = useState<number | "">("");
  const [montoRecargo, setMontoRecargo] = useState<number | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<FormAlert | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { showSuccess, showError, showWarning } = useNotifications();

  // Cargar configuración existente si existe
  useEffect(() => {
    if (existingConfig) {
      setTipoConfiguracion(existingConfig.tipoConfiguracion);

      if (
        existingConfig.tipoConfiguracion === "FIJA_MENSUAL" &&
        existingConfig.rangos
      ) {
        setRangos(
          existingConfig.rangos.map((rango: any) => ({
            id: rango.id,
            tempId: crypto.randomUUID(),
            diaInicio: rango.diaInicio,
            diaFin: rango.diaFin,
            monto: rango.monto,
          }))
        );
      } else if (
        existingConfig.tipoConfiguracion === "DINAMICA_POR_FECHA_INGRESO"
      ) {
        setMontoBase(existingConfig.montoBase || "");
        setDiasGracia(existingConfig.diasGracia || "");
        setMontoRecargo(existingConfig.montoRecargo || "");
      }
    }
  }, [existingConfig]);

  // Limpiar alertas cuando cambia el tipo de configuración
  useEffect(() => {
    setAlert(null);
    setValidationErrors([]);
  }, [tipoConfiguracion]);

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (tipoConfiguracion === "FIJA_MENSUAL") {
      if (rangos.length === 0) {
        errors.push("Debe agregar al menos un rango de tarifa");
      }

      // Validar cada rango
      rangos.forEach((rango, index) => {
        if (!rango.diaInicio || !rango.diaFin || !rango.monto) {
          errors.push(`Rango ${index + 1}: Todos los campos son obligatorios`);
        } else {
          if (Number(rango.diaInicio) > Number(rango.diaFin)) {
            errors.push(
              `Rango ${
                index + 1
              }: El día de inicio no puede ser mayor al día de fin`
            );
          }
          if (Number(rango.monto) <= 0) {
            errors.push(`Rango ${index + 1}: El monto debe ser mayor a 0`);
          }
        }
      });

      // Validar solapamientos
      for (let i = 0; i < rangos.length; i++) {
        for (let j = i + 1; j < rangos.length; j++) {
          const rangoA = rangos[i];
          const rangoB = rangos[j];
          if (
            Number(rangoA.diaInicio) <= Number(rangoB.diaFin) &&
            Number(rangoA.diaFin) >= Number(rangoB.diaInicio)
          ) {
            errors.push(`Los rangos ${i + 1} y ${j + 1} se superponen`);
          }
        }
      }
    } else {
      if (!montoBase || !diasGracia || !montoRecargo) {
        errors.push("Todos los campos de tarifa dinámica son obligatorios");
      } else {
        if (Number(montoBase) <= 0) {
          errors.push("El monto base debe ser mayor a 0");
        }
        if (Number(diasGracia) < 0) {
          errors.push("Los días de gracia no pueden ser negativos");
        }
        if (Number(montoRecargo) <= 0) {
          errors.push("El monto con recargo debe ser mayor a 0");
        }
        if (Number(montoRecargo) <= Number(montoBase)) {
          errors.push("El monto con recargo debe ser mayor al monto base");
        }
      }
    }

    return errors;
  };

  const handleAddRango = () => {
    setRangos([
      ...rangos,
      { tempId: crypto.randomUUID(), diaInicio: "", diaFin: "", monto: "" },
    ]);
    setAlert(null);
  };

  const handleRemoveRango = (tempId: string) => {
    setRangos(rangos.filter((rango) => rango.tempId !== tempId));
    setAlert(null);
  };

  const handleRangoChange = (
    tempId: string,
    field: keyof Omit<RangoTarifaForm, "id" | "tempId">,
    value: string
  ) => {
    setRangos(
      rangos.map((rango) =>
        rango.tempId === tempId
          ? { ...rango, [field]: value === "" ? "" : Number.parseFloat(value) }
          : rango
      )
    );
    // Limpiar errores cuando el usuario empiece a corregir
    if (validationErrors.length > 0) {
      setValidationErrors([]);
      setAlert(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);
    setValidationErrors([]);

    // Validar formulario
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      setAlert({
        type: "error",
        title: "Errores de validación",
        description: "Por favor, corrige los errores antes de continuar",
      });
      showError("Formulario inválido", "Revisa los campos marcados en rojo");
      return;
    }

    setIsLoading(true);

    try {
      let configData: any;

      if (tipoConfiguracion === "FIJA_MENSUAL") {
        configData = {
          tipoConfiguracion,
          rangos: rangos.map((rango) => ({
            id: rango.id,
            diaInicio: Number(rango.diaInicio),
            diaFin: Number(rango.diaFin),
            monto: Number(rango.monto),
          })),
        };
      } else {
        configData = {
          tipoConfiguracion,
          montoBase: Number(montoBase),
          diasGracia: Number(diasGracia),
          montoRecargo: Number(montoRecargo),
        };
      }

      const result = await saveTariffConfiguration(configData);

      if (result.ok) {
        const isEditing = !!existingConfig;
        const successMessage = isEditing
          ? "Configuración actualizada"
          : "Configuración creada";
        const successDescription = isEditing
          ? "Tu configuración de tarifas ha sido actualizada exitosamente"
          : "Tu nueva configuración de tarifas ha sido creada exitosamente";

        setAlert({
          type: "success",
          title: successMessage,
          description: successDescription,
        });

        showSuccess(successMessage, successDescription);

        // Esperar un poco antes de cambiar de pestaña para que el usuario vea el mensaje
        setTimeout(() => {
          onSuccess?.();
        }, 1500);
      } else {
        const errorMessage =
          result.message || "Error desconocido al guardar la configuración";
        setAlert({
          type: "error",
          title: "Error al guardar",
          description: errorMessage,
        });
        showError("Error al guardar", errorMessage);
      }
    } catch (error) {
      const errorMessage = "Error inesperado. Por favor, intenta nuevamente.";
      setAlert({
        type: "error",
        title: "Error inesperado",
        description: errorMessage,
      });
      showError("Error inesperado", errorMessage);
      console.error("Error:", error);
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
            {existingConfig ? "Editar" : "Crear"} Configuración de Tarifas
          </CardTitle>
          <CardDescription>
            {existingConfig
              ? "Modifica tu configuración actual de tarifas."
              : "Define cómo se calcularán las cuotas para tus usuarios."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mostrar alerta general */}
          {alert && (
            <AlertMessage
              type={alert.type}
              title={alert.title}
              description={alert.description}
              className="mb-4"
            />
          )}

          {/* Mostrar errores de validación */}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo de Configuración */}
            <div className="space-y-3">
              <Label
                htmlFor="tipoConfiguracion"
                className="text-base font-medium"
              >
                Tipo de Configuración
              </Label>
              <div className="relative">
                <Select
                  value={tipoConfiguracion}
                  onValueChange={(value: TipoConfiguracionTarifa) =>
                    setTipoConfiguracion(value)
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
            </div>

            {/* Configuración Fija Mensual */}
            {tipoConfiguracion === "FIJA_MENSUAL" && (
              <div className="space-y-6 border border-gray-200 p-6 rounded-lg bg-gray-50/50">
                <h3 className="text-lg font-semibold text-gray-900">
                  Rangos de Tarifa Fija Mensual
                </h3>

                <div className="space-y-4">
                  {rangos.map((rango, index) => (
                    <div
                      key={rango.tempId}
                      className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium text-gray-700">
                          Rango {index + 1}
                        </h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveRango(rango.tempId)}
                          disabled={rangos.length === 1 || isLoading}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor={`diaInicio-${rango.tempId}`}
                            className="text-sm font-medium"
                          >
                            Día Inicio
                          </Label>
                          <Input
                            id={`diaInicio-${rango.tempId}`}
                            type="number"
                            placeholder="Ej: 1"
                            value={rango.diaInicio}
                            onChange={(e) =>
                              handleRangoChange(
                                rango.tempId,
                                "diaInicio",
                                e.target.value
                              )
                            }
                            min="1"
                            max="31"
                            required
                            disabled={isLoading}
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor={`diaFin-${rango.tempId}`}
                            className="text-sm font-medium"
                          >
                            Día Fin
                          </Label>
                          <Input
                            id={`diaFin-${rango.tempId}`}
                            type="number"
                            placeholder="Ej: 10"
                            value={rango.diaFin}
                            onChange={(e) =>
                              handleRangoChange(
                                rango.tempId,
                                "diaFin",
                                e.target.value
                              )
                            }
                            min="1"
                            max="31"
                            required
                            disabled={isLoading}
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor={`monto-${rango.tempId}`}
                            className="text-sm font-medium"
                          >
                            Monto ($)
                          </Label>
                          <Input
                            id={`monto-${rango.tempId}`}
                            type="number"
                            step="0.01"
                            placeholder="Ej: 15000"
                            value={rango.monto}
                            onChange={(e) =>
                              handleRangoChange(
                                rango.tempId,
                                "monto",
                                e.target.value
                              )
                            }
                            required
                            disabled={isLoading}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddRango}
                  disabled={isLoading}
                  className="w-full border-dashed border-2 hover:bg-gray-50 bg-transparent"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Agregar Nuevo Rango
                </Button>
              </div>
            )}

            {/* Configuración Dinámica */}
            {tipoConfiguracion === "DINAMICA_POR_FECHA_INGRESO" && (
              <div className="space-y-6 border border-gray-200 p-6 rounded-lg bg-gray-50/50">
                <h3 className="text-lg font-semibold text-gray-900">
                  Tarifa Dinámica por Fecha de Ingreso
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="montoBase" className="text-sm font-medium">
                      Monto Base ($)
                    </Label>
                    <Input
                      id="montoBase"
                      type="number"
                      step="0.01"
                      placeholder="Ej: 15000"
                      value={montoBase}
                      onChange={(e) => {
                        setMontoBase(
                          e.target.value === ""
                            ? ""
                            : Number.parseFloat(e.target.value)
                        );
                        if (validationErrors.length > 0) {
                          setValidationErrors([]);
                          setAlert(null);
                        }
                      }}
                      required
                      disabled={isLoading}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="diasGracia" className="text-sm font-medium">
                      Días de Gracia
                    </Label>
                    <Input
                      id="diasGracia"
                      type="number"
                      placeholder="Ej: 5"
                      value={diasGracia}
                      onChange={(e) => {
                        setDiasGracia(
                          e.target.value === ""
                            ? ""
                            : Number.parseInt(e.target.value)
                        );
                        if (validationErrors.length > 0) {
                          setValidationErrors([]);
                          setAlert(null);
                        }
                      }}
                      min="0"
                      required
                      disabled={isLoading}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-600">
                      Días después del vencimiento antes de aplicar recargo.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Label
                      htmlFor="montoRecargo"
                      className="text-sm font-medium"
                    >
                      Monto con Recargo ($)
                    </Label>
                    <Input
                      id="montoRecargo"
                      type="number"
                      step="0.01"
                      placeholder="Ej: 18000"
                      value={montoRecargo}
                      onChange={(e) => {
                        setMontoRecargo(
                          e.target.value === ""
                            ? ""
                            : Number.parseFloat(e.target.value)
                        );
                        if (validationErrors.length > 0) {
                          setValidationErrors([]);
                          setAlert(null);
                        }
                      }}
                      required
                      disabled={isLoading}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-600">
                      Monto total si se exceden los días de gracia.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {validationErrors.length > 0 && (
              <div className="space-y-2">
                {validationErrors.map((error, index) => (
                  <AlertMessage
                    key={index}
                    type="error"
                    title={error}
                    className="text-sm"
                  />
                ))}
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <Button
                type="submit"
                disabled={isLoading}
                className="min-w-[140px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {existingConfig ? "Actualizar" : "Crear"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
