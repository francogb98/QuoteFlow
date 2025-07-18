"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";
import { crearTarifas } from "@/actions/users";
import { Button } from "@/components/ui/button";

export function CrearTarifas() {
  const router = useRouter();
  const [rango, setRango] = useState({
    diaInicio: "",
    diaFin: "",
    monto: "",
  });

  const mutation = useMutation({
    mutationFn: crearTarifas,
    onSuccess: (data) => {
      if (!data.ok) {
        toast.error(data.message || "Error al crear configuración");
        return;
      }
      toast.success("Configuración de tarifas creada exitosamente");
      router.refresh();
    },
    onError: (error) => {
      toast.error("Error al crear configuración", {
        description: error.message,
      });
    },
  });

  const handleChange = (
    field: "diaInicio" | "diaFin" | "monto",
    value: string
  ) => {
    setRango((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { diaInicio, diaFin, monto } = rango;

    if (!diaInicio || !diaFin || !monto) {
      toast.warning("Completá todos los campos");
      return;
    }

    const diaInicioNum = +diaInicio;
    const diaFinNum = +diaFin;
    const montoNum = +monto;

    if (montoNum <= 0) {
      toast.warning("El monto debe ser mayor a cero");
      return;
    }

    if (diaInicioNum < 1 || diaFinNum > 31) {
      toast.warning("Los días deben estar entre 1 y 31");
      return;
    }
    mutation.mutate({
      diaInicio: diaInicioNum,
      diaFin: diaFinNum,
      monto: montoNum,
      estaActiva: true,
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="grid grid-cols-12 gap-3 items-center text-sm font-medium text-gray-600 pb-2 border-b border-gray-200">
            <div className="col-span-4">Período</div>
            <div className="col-span-4">Rango de días</div>
            <div className="col-span-4">Precio ($)</div>
          </div>

          {/* Único rango */}
          <div className="grid grid-cols-12 gap-3 items-center p-3 bg-gray-50 rounded-lg">
            <div className="col-span-4 text-gray-700 font-medium">
              Día {rango.diaInicio || "-"} a {rango.diaFin || "-"}
            </div>

            <div className="col-span-4 flex gap-2 items-center">
              <input
                type="number"
                min="1"
                max="31"
                value={rango.diaInicio}
                onChange={(e) => handleChange("diaInicio", e.target.value)}
                className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <span className="text-gray-500">a</span>
              <input
                type="number"
                min="1"
                max="31"
                value={rango.diaFin}
                onChange={(e) => handleChange("diaFin", e.target.value)}
                className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <input
              type="number"
              value={rango.monto === "0" ? "0" : rango.monto || ""}
              onChange={(e) => handleChange("monto", e.target.value)}
              className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent col-span-4"
            />
          </div>
        </div>

        {/* Botón guardar */}
        <div className="pt-4 border-t border-gray-200">
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white py-3 text-lg font-medium"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Guardar Configuración
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
