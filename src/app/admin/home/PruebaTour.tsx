"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// import { InteractiveTour } from "@/components/interactive-tour";
// import { useTour } from "@/hooks/use-tour";
import {
  BarChart3,
  Users,
  CreditCard,
  Settings,
  BarChart,
  Table,
  Table2,
  LineChart,
} from "lucide-react";
import Link from "next/link";
import { ShareCompanyLink } from "./ui/SharedCompanyLink";
// import { InteractiveTour } from "@/01-components/admin/tour/interactive-tour";
// import { useTour } from "@/01-components/admin/tour/use-tour";
import { Rol } from "@prisma/client";
import { SubscriptionPage } from "@/01-components/admin/suscripcion/SuscripcionPage";

interface PruebaTourProps {
  user?: {
    nombre?: string;
    rol: Rol;
    empresa?: {
      nombre?: string;
    };
  };
  link?: string;
}

export default function PruebaTour({ user, link }: PruebaTourProps) {
  const userName = user?.nombre || "Usuario";
  const companyName = user?.empresa?.nombre || "Mi Empresa";
  const shareLink = link || "http://localhost:3000";

  // const { startTour } = useTour();

  return (
    <div className="bg-background">
      {/* <InteractiveTour /> */}
      {/* Main Content */}
      <main className="container mx-auto px-4 space-y-2">
        {/* Welcome Section */}
        <div className="flex justify-end" data-tour="share-link">
          <ShareCompanyLink companyName={companyName} link={shareLink} />
        </div>
        <div className="flex-1 text-center mb-4" data-tour="welcome">
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-purple-600 bg-clip-text text-transparent">
            ¡Bienvenido {userName}!
          </h2>
          <p className="text-muted-foreground mb-4">
            Descubre todas las funcionalidades que tenemos para ti.
          </p>
          {/* <Button
            onClick={startTour}
            variant="outline"
            className="border-emerald-200 text-emerald-700 hover:bg-purple-50 hover:text-emerald-800 hover:border-purple-300"
          >
            Hacer tour de la aplicación
          </Button> */}
        </div>

        {/* Feature Cards */}
        {/* Embed SubscriptionPage here for admins (not professors) - moved above cards */}
        {/* {user?.rol !== "PROFESOR" && (
          <div className="mb-6">
            <SubscriptionPage />
          </div>
        )} */}

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {user?.rol !== "PROFESOR" && (
            <>
              <Link href="/admin/modelo-cobro">
                <Card
                  data-tour="modelo-cobro"
                  className="border-emerald-200 hover:border-purple-300 bg-gradient-to-br from-emerald-50/50 to-purple-50/50 hover:shadow-lg transition-all duration-300"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[10px] sm:text-[15px]">
                      <CreditCard className="w-5 h-5 text-emerald-600" />
                      Modelo de Cobro
                    </CardTitle>
                    <CardDescription className="text-[9px] sm:text-xs">
                      Selecciona tu modelo de cobro preferido.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
              <Link href="/admin/tarifas">
                <Card
                  data-tour="tarifas"
                  className="border-emerald-200 hover:border-purple-300 bg-gradient-to-br from-emerald-50/50 to-purple-50/50 hover:shadow-lg transition-all duration-300"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[10px] sm:text-[15px]">
                      <BarChart3 className="w-5 h-5 text-emerald-600" />
                      Tarifas
                    </CardTitle>
                    <CardDescription className="text-[9px] sm:text-xs">
                      Gestiona tus tarifas de manera eficiente.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
              <Link href="/admin/account">
                <Card
                  data-tour="equipo"
                  className="border-emerald-200 hover:border-purple-300 bg-gradient-to-br from-emerald-50/50 to-purple-50/50 hover:shadow-lg transition-all duration-300"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[10px] sm:text-[15px]">
                      <Users className="w-5 h-5 text-emerald-600" />
                      Gestión de Equipo
                    </CardTitle>
                    <CardDescription className="text-[9px] sm:text-xs">
                      Administra tu equipo de trabajo y permisos
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </>
          )}
          <Link href="/admin/analytics">
            <Card
              data-tour="analitica"
              className="border-emerald-200 hover:border-purple-300 bg-gradient-to-br from-emerald-50/50 to-purple-50/50 hover:shadow-lg transition-all duration-300"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[10px] sm:text-[15px]">
                  <LineChart className="w-5 h-5 text-emerald-600" />
                  Analítica de Pagos
                </CardTitle>
                <CardDescription className="text-[9px] sm:text-xs">
                  <p className="text-[9px] sm:text-sm text-muted-foreground">
                    Visualiza estadísticas detalladas de los pagos realizados.
                  </p>
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/admin/pagos">
            <Card
              data-tour="pagos"
              className="border-emerald-200 hover:border-purple-300 bg-gradient-to-br from-emerald-50/50 to-purple-50/50 hover:shadow-lg transition-all duration-300"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[10px] sm:text-[15px]">
                  <Users className="w-5 h-5 text-emerald-600" />
                  Pagos
                </CardTitle>
                <CardDescription className="text-[9px] sm:text-xs">
                  <p className="text-[9px] sm:text-sm text-muted-foreground">
                    Visualiza todos los pagos realizados y su estado actual.
                  </p>
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/admin/users">
            <Card
              data-tour="usuarios"
              className="border-emerald-200 hover:border-purple-300 bg-gradient-to-br from-emerald-50/50 to-purple-50/50 hover:shadow-lg transition-all duration-300"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[10px] sm:text-[15px]">
                  <Table2 className="w-5 h-5 text-emerald-600" />
                  Mis Usuarios
                </CardTitle>
                <CardDescription className="text-[9px] sm:text-xs">
                  Gestiona tus usuarios, crea, modifica y elimina.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/admin/settings">
            <Card
              data-tour="settings"
              className="border-emerald-200 hover:border-purple-300 bg-gradient-to-br from-emerald-50/50 to-purple-50/50 hover:shadow-lg transition-all duration-300"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[10px] sm:text-[15px]">
                  <Settings className="w-5 h-5 text-emerald-600" />
                  Mis Datos
                </CardTitle>
                <CardDescription className="text-[9px] sm:text-xs">
                  Gestiona tus datos personales y de cuenta.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          {user?.rol === "SUPER_ADMIN" && (
            <>
              <Link href="/admin/test">
                <Card
                  data-tour="test"
                  className="border-emerald-200 hover:border-purple-300 bg-gradient-to-br from-emerald-50/50 to-purple-50/50 hover:shadow-lg transition-all duration-300"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[10px] sm:text-[15px]">
                      <Settings className="w-5 h-5 text-emerald-600" />
                      Test
                    </CardTitle>
                    <CardDescription className="text-[9px] sm:text-xs">
                      Funcion para ejecutar Test de la aplicacion
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
              <Link href="/admin/codigos">
                <Card
                  data-tour="codigos"
                  className="border-emerald-200 hover:border-purple-300 bg-gradient-to-br from-emerald-50/50 to-purple-50/50 hover:shadow-lg transition-all duration-300"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[10px] sm:text-[15px]">
                      <Settings className="w-5 h-5 text-emerald-600" />
                      Codigos
                    </CardTitle>
                    <CardDescription className="text-[9px] sm:text-xs">
                      Funcion para gestionar los codigos de la aplicacion
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
              <Link href="/admin/fix-payments">
                <Card
                  data-tour="settings"
                  className="border-emerald-200 hover:border-purple-300 bg-gradient-to-br from-emerald-50/50 to-purple-50/50 hover:shadow-lg transition-all duration-300"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[10px] sm:text-[15px]">
                      <Settings className="w-5 h-5 text-emerald-600" />
                      corregidale
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Link>
              <Link href="/admin/diagrama">
                <Card
                  data-tour="settings"
                  className="border-emerald-200 hover:border-purple-300 bg-gradient-to-br from-emerald-50/50 to-purple-50/50 hover:shadow-lg transition-all duration-300"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[10px] sm:text-[15px]">
                      <Settings className="w-5 h-5 text-emerald-600" />
                      Diagramas
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Link>
              <Link href="/admin/users/report">
                <Card
                  data-tour="settings"
                  className="border-emerald-200 hover:border-purple-300 bg-gradient-to-br from-emerald-50/50 to-purple-50/50 hover:shadow-lg transition-all duration-300"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[10px] sm:text-[15px]">
                      <Settings className="w-5 h-5 text-emerald-600" />
                      Reporte Usuarios
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
