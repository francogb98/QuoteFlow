import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Link,
  CreditCard,
  BarChart3,
  Users,
  LineChart,
  Table2,
  Settings,
} from "lucide-react";

export default function NamePage() {
  return (
    <div>
      {/* <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
      </div> */}
    </div>
  );
}
