"use client";

import * as React from "react";
import {
  Building2Icon,
  MessageCircleIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";
import { auth } from "@/auth.config";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

export default function DashboardPage() {
  const [isConfigured, setIsConfigured] = React.useState(false);

  // Verificar si el usuario tiene configuración de tarifa
  const { data: adminData, isLoading } = useQuery({
    queryKey: ["adminConfig"],
    queryFn: async () => {
      const session = await auth();
      if (!session?.user) return null;

      const response = await fetch("/api/admin/config");
      if (!response.ok) return null;
      return response.json();
    },
  });

  // Verificar si el usuario tiene configuración de tarifa
  React.useEffect(() => {
    if (adminData?.hasConfiguracionTarifa) {
      setIsConfigured(true);
    }
  }, [adminData, isLoading]);

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary">
              <Building2Icon className="size-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">
                {adminData?.empresaNombre || "Mi Empresa"}
              </h1>
              <p className="text-xs text-muted-foreground">
                Sistema de Gestión de Pagos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <SettingsIcon className="size-4" />
              Configuración inicial
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Welcome banner */}
        <div className="mb-8 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/20">
              <Building2Icon className="size-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                ¡Bienvenido, {adminData?.nombre || "Administrador"}!
              </h2>
              <p className="mt-1 text-muted-foreground">
                {isConfigured
                  ? "Tu cuenta está configurada y lista para gestionar pagos."
                  : "Completa la configuración inicial para comenzar a gestionar los pagos de tus usuarios."}
              </p>
              {!isConfigured && (
                <Button className="mt-4">
                  <SettingsIcon className="size-4" />
                  Completar configuración
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Usuarios activos</CardDescription>
              <CardTitle className="text-3xl">
                {isConfigured ? "1" : "0"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {isConfigured
                  ? "Usuario de prueba creado"
                  : "Completa la configuración"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pagos pendientes</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Sin pagos pendientes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Ingresos del mes</CardDescription>
              <CardTitle className="text-3xl">$0</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Comienza a recibir pagos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Notificaciones enviadas</CardDescription>
              <CardTitle className="text-3xl">
                {isConfigured ? "1" : "0"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {isConfigured ? "WhatsApp de prueba" : "Configura WhatsApp"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-semibold">Acciones rápidas</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <UsersIcon className="size-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      Gestionar usuarios
                    </CardTitle>
                    <CardDescription>
                      Agrega y administra usuarios
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                    <Building2Icon className="size-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      Configurar tarifas
                    </CardTitle>
                    <CardDescription>
                      Edita tus tarifas de cobro
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <SettingsIcon className="size-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Configuración</CardTitle>
                    <CardDescription>Ajustes de la cuenta</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Demo reset button */}
        <div className="mt-12 flex justify-center">
          <Button variant="outline">Reiniciar demo</Button>
        </div>
      </div>
    </main>
  );
}
