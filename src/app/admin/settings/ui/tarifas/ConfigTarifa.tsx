"use client";

import { updateRangoTarifas } from "@/actions/users";
import { RangoTarifa } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { FiSave, FiEdit2, FiX } from "react-icons/fi";
import { toast } from "sonner";

interface Props {
  tarifas: RangoTarifa[];
}

export function ConfigTarfas({ tarifas }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  const update = useMutation({
    mutationFn: updateRangoTarifas,
    onSuccess: async (data) => {
      if (!data.ok) {
        toast.error(data.message || "Error al actualizar tarifas");
        return;
      }
      toast.success("Tarifas actualizadas correctamente");
      setEditingId(null);
    },
    onError: (error) => {
      toast.error("Error al actualizar tarifas", {
        description: error.message,
      });
    },
  });

  const handleEdit = (tarifa: RangoTarifa) => {
    setEditingId(tarifa.id);
    setFormValues({
      diaInicio: tarifa.diaInicio,
      diaFin: tarifa.diaFin,
      monto: tarifa.monto,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent, tarifa: RangoTarifa) => {
    e.preventDefault();

    const data = {
      configuracionTarifaId: tarifa.configuracionTarifaId,
      tarifaId: tarifa.id,
      diaInicio: Number(formValues.diaInicio),
      diaFin: Number(formValues.diaFin),
      monto: Number(formValues.monto),
    };

    update.mutate(data);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-2 items-center text-start text-sm font-medium text-gray-500 mb-2">
        <div className="col-span-4">Días</div>
        <div className="col-span-4">Precio ($)</div>
        <div className="col-span-4">Acciones</div>
      </div>

      {tarifas.map((tarifa) => (
        <form
          onSubmit={(e) => handleSubmit(e, tarifa)}
          key={tarifa.id}
          className="grid grid-cols-12 gap-2 items-center"
        >
          <input
            type="hidden"
            name="configuracionTarifaId"
            value={tarifa.configuracionTarifaId}
          />
          <input type="hidden" name="tarifaId" value={tarifa.id} />

          <div className="col-span-4 text-gray-700">
            {editingId === tarifa.id ? (
              <div className="flex gap-2">
                <input
                  type="number"
                  name="diaInicio"
                  value={formValues.diaInicio || ""}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  required
                />
                <span className="self-center">a</span>
                <input
                  type="number"
                  name="diaFin"
                  value={formValues.diaFin || ""}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min={formValues.diaInicio || 0}
                  required
                />
              </div>
            ) : (
              <span>
                Día {tarifa.diaInicio} a {tarifa.diaFin}
              </span>
            )}
          </div>

          <div className="col-span-4">
            {editingId === tarifa.id ? (
              <input
                type="number"
                name="monto"
                value={formValues.monto || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.01"
                required
              />
            ) : (
              <span>${tarifa.monto.toFixed(2)}</span>
            )}
          </div>

          <div className="col-span-4 flex gap-2 items-center">
            {editingId === tarifa.id ? (
              <>
                {update.isPending && (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                )}
                <button
                  type="submit"
                  className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm h-fit"
                  disabled={update.isPending}
                >
                  <FiSave size={14} />
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm h-fit"
                >
                  <FiX size={14} />
                  Cancelar
                </button>
              </>
            ) : (
              <div
                onClick={() => handleEdit(tarifa)}
                className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm cursor-pointer"
              >
                <FiEdit2 size={14} />
                Editar
              </div>
            )}
          </div>
        </form>
      ))}
    </div>
  );
}
