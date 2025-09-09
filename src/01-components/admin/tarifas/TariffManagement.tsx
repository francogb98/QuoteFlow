"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Eye, Plus } from "lucide-react";
import { TariffDashboard } from "./TariffDashboard";
import { InfoBanner } from "./InfoBanner";
import { ActualizarTarifaForm } from "./ActualizarTarifa";
import { CrearTarifaForm } from "./CrearTarifas";

interface TariffManagementProps {
  user: any;
}

export function TariffManagement({ user }: TariffManagementProps) {
  const [activeTab, setActiveTab] = useState("view");

  // CORREGIR: usar configuracionTarifa en lugar de configuracionTarifa
  const hasConfiguracion = !!user?.configuracionTarifa;

  return (
    <div className="w-full mx-auto space-y-6 px-10">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent text-center">
          Gestión de Tarifas
        </h1>
        {user.modeloDeCobro === "MERCADOPAGO" && <InfoBanner />}
      </div>

      {/* Tabs Container */}
      <div className="w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="view" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Ver Configuración
            </TabsTrigger>
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              {hasConfiguracion ? "Editar" : "Crear"} Tarifas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="view" className="mt-0 space-y-4">
            <TariffDashboard user={user} />
            {!hasConfiguracion && (
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Plus className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No tienes tarifas configuradas
                  </h3>
                  <p className="text-gray-500 text-center mb-4 max-w-md">
                    Crea tu primera configuración de tarifas para comenzar a
                    gestionar los pagos de tus usuarios.
                  </p>
                  <Button onClick={() => setActiveTab("edit")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Primera Tarifa
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="edit" className="mt-0">
            {hasConfiguracion ? (
              <ActualizarTarifaForm
                existingConfig={user.configuracionTarifa}
                onSuccess={() => {
                  setActiveTab("view");
                  // Aquí podrías revalidar los datos o mostrar un mensaje de éxito
                }}
              />
            ) : (
              <CrearTarifaForm
                administradorId={user.id}
                onSuccess={() => {
                  setActiveTab("view");
                  // Aquí podrías revalidar los datos o mostrar un mensaje de éxito
                }}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
