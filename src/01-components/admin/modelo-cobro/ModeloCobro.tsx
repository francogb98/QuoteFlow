"use client";

import { actualizarModeloCobro } from "@/01-actions/admin/settings/modeloDeCobroChange";
import type { ModeloDeCobro } from "@prisma/client";
import { Check, CreditCard, FileText } from "lucide-react";
import { useState } from "react";

interface ModeloCobroProps {
  usuario?: {
    modeloDeCobro: ModeloDeCobro;
  };
}

const modelos = [
  {
    id: "MERCADOPAGO" as ModeloDeCobro,
    titulo: "MercadoPago",
    descripcion: "Integración automática con procesamiento de pagos",
    icono: CreditCard,
    ventajas: [
      "Actualización automática de pagos",
      "Manejo preciso de montos",
      "Múltiples métodos de pago",
      "Seguridad garantizada",
      "Reportes detallados",
    ],
    desventajas: [
      "Cobra comisiones por transacción",
      "Requiere configuración inicial",
      "Dependes de la plataforma",
    ],
    recomendado: true,
  },
  {
    id: "COMPROBANTE" as ModeloDeCobro,
    titulo: "Comprobantes de Pago",
    descripcion: "Gestión manual mediante comprobantes subidos por clientes",
    icono: FileText,
    ventajas: [
      "Sin comisiones adicionales",
      "Control total del proceso",
      "Flexibilidad en métodos de pago",
      "Ideal para pagos en efectivo",
    ],
    desventajas: [
      "Actualización manual de estados",
      "Requiere revisión de comprobantes",
      "Mayor tiempo de procesamiento",
      "Posibles errores humanos",
    ],
    recomendado: false,
  },
];

export const ModeloCobro = ({ usuario }: ModeloCobroProps) => {
  const [selectedModel, setSelectedModel] = useState<ModeloDeCobro | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  if (!usuario) {
    return (
      <section>
        <h1 className="capitalize mb-3 text-2xl font-bold bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent">
          Elige tu modelo de cobro
        </h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <p className="text-yellow-800">
            No se pudo cargar la información del usuario.
          </p>
        </div>
      </section>
    );
  }

  const handleModelSelect = (model: ModeloDeCobro) => {
    if (model === usuario.modeloDeCobro) {
      setSelectedModel(null); // Reset if selecting current model
    } else {
      setSelectedModel(model);
    }
    setMessage(null); // Clear any previous messages
  };

  const handleUpdateModel = async () => {
    if (!selectedModel) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await actualizarModeloCobro(selectedModel);

      if (result.success) {
        setMessage({
          type: "success",
          text: result.message || "Modelo actualizado correctamente",
        });
        setSelectedModel(null); // Reset selection after successful update
      } else {
        setMessage({
          type: "error",
          text: result.error || "Error al actualizar el modelo",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Error inesperado al actualizar el modelo",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentModel = modelos.find(
    (modelo) => modelo.id === usuario.modeloDeCobro
  );
  const hasPendingChanges =
    selectedModel && selectedModel !== usuario.modeloDeCobro;

  return (
    <section>
      <h1 className="capitalize mb-3 text-5xl font-bold bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent text-center">
        Modelo de cobro
      </h1>

      {usuario.modeloDeCobro && currentModel && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              {currentModel.icono && (
                <currentModel.icono className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Modelo de cobro actual:
              </p>
              <p className="text-lg font-bold text-blue-700">
                {currentModel.titulo}
              </p>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {hasPendingChanges && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-800 font-medium">Cambios pendientes</p>
              <p className="text-amber-700 text-sm">
                Seleccionaste:{" "}
                {modelos.find((m) => m.id === selectedModel)?.titulo}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedModel(null)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateModel}
                disabled={isLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {isLoading ? "Actualizando..." : "Actualizar Modelo de Cobro"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-purple-100 mb-8 overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="flex items-center gap-2 text-purple-600">
              <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Actualizando...</span>
            </div>
          </div>
        )}

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {modelos.map((modelo) => {
              const IconComponent = modelo.icono;
              const isSelected = usuario.modeloDeCobro === modelo.id;
              const isPendingSelection = selectedModel === modelo.id;

              return (
                <div
                  key={modelo.id}
                  className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    isSelected
                      ? "border-purple-500 bg-purple-50/50 shadow-md"
                      : isPendingSelection
                        ? "border-amber-400 bg-amber-50/50 shadow-md"
                        : "border-gray-200 hover:border-purple-300"
                  } ${isLoading ? "pointer-events-none opacity-75" : ""}`}
                  onClick={() => !isLoading && handleModelSelect(modelo.id)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${isSelected ? "bg-purple-100" : isPendingSelection ? "bg-amber-100" : "bg-gray-100"}`}
                      >
                        <IconComponent
                          className={`w-6 h-6 ${isSelected ? "text-purple-600" : isPendingSelection ? "text-amber-600" : "text-gray-600"}`}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {modelo.titulo}
                        </h3>
                        {modelo.recomendado && (
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Recomendado
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="p-1 bg-purple-500 rounded-full">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    {isPendingSelection && !isSelected && (
                      <div className="p-1 bg-amber-500 rounded-full">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4">
                    {modelo.descripcion}
                  </p>

                  {/* Ventajas */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2 text-sm">
                      Ventajas:
                    </h4>
                    <ul className="space-y-1">
                      {modelo.ventajas.map((ventaja, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{ventaja}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Desventajas */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 text-sm">
                      Consideraciones:
                    </h4>
                    <ul className="space-y-1">
                      {modelo.desventajas.map((desventaja, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-gray-600"
                        >
                          <div className="w-4 h-4 mt-0.5 flex-shrink-0">
                            <div className="w-2 h-2 bg-orange-400 rounded-full mt-1 mx-auto"></div>
                          </div>
                          <span>{desventaja}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
