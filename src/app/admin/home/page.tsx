import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  Settings,
  UserPlus,
  CreditCard,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { ShareCompanyLink } from "./ui/SharedCompanyLink";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const user = session.user;

  // Determinar el estado de los pasos
  const isMercadoPagoConfigured = !!user.claveMercadoPago;
  const isTariffConfigured = !!user.configuracionTarifa;

  const configurationSteps = [
    {
      id: "mercado_pago",
      title: "Configuración de pagos",
      description: "Conecta tu cuenta de Mercado Pago para recibir pagos.",
      icon: <CreditCard className="h-5 w-5" />,
      completed: isMercadoPagoConfigured,
      url: "/admin/market",
      color: "emerald",
    },
    {
      id: "tarifas",
      title: "Configurar tarifas",
      description: "Establece tus planes de suscripción y precios.",
      icon: <Settings className="h-5 w-5" />,
      completed: isTariffConfigured,
      url: "/admin/settings",
      color: "purple",
    },
    {
      id: "usuarios",
      title: "Agregar usuarios",
      description: "Crea o importa tus primeros usuarios/clientes.",
      icon: <UserPlus className="h-5 w-5" />,
      completed: false,
      url: "/admin/users/list",
      color: "blue",
    },
  ];

  const pendingSteps = configurationSteps.filter((step) => !step.completed);
  const completedSteps = configurationSteps.filter(
    (step) => step.completed && step.id !== "usuarios"
  );

  const completionPercentage = Math.round(
    (completedSteps.length / (configurationSteps.length - 1)) * 100
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header mejorado */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-purple-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-emerald-500/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="relative">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Bienvenido,{" "}
                  <span className="bg-gradient-to-r from-purple-600 to-emerald-600 bg-clip-text text-transparent">
                    {user.name}
                  </span>
                </h1>
                <p className="text-gray-500 mt-1 text-sm md:text-base">
                  {pendingSteps.length > 0
                    ? `Tienes ${pendingSteps.length} pasos pendientes para comenzar`
                    : "¡Tu cuenta está completamente configurada!"}
                </p>
              </div>
            </div>

            {/* Barra de progreso en el header */}
            {completedSteps.length > 0 && (
              <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-emerald-50 rounded-xl border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Progreso de configuración
                  </span>
                  <span className="text-sm font-bold text-purple-600">
                    {completionPercentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-emerald-500 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Compartir enlace */}
        <div>
          {user.empresa.nombre && (
            <ShareCompanyLink companyName={user.empresa.nombre} />
          )}
        </div>

        {/* Pasos de configuración mejorados */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-purple-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <Settings className="w-4 h-4 text-white" />
            </div>
            {pendingSteps.length > 0
              ? "Pasos pendientes"
              : "Configuración completada"}
          </h2>

          {/* Pasos pendientes */}
          {pendingSteps.length > 0 && (
            <div className="space-y-4 mb-6">
              {pendingSteps.map((step, index) => (
                <div
                  key={step.id}
                  className="group relative overflow-hidden rounded-xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5 transition-all duration-300 hover:shadow-lg hover:border-amber-300"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="relative flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center text-white mr-4">
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-amber-900">
                          {step.title}
                        </h3>
                        <span className="text-xs font-medium text-amber-700 bg-amber-200 px-2 py-1 rounded-full">
                          Paso {index + 1}
                        </span>
                      </div>
                      <p className="text-amber-700 mb-4 text-sm leading-relaxed">
                        {step.description}
                      </p>
                      <Link
                        href={step.url}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300"
                      >
                        Configurar ahora
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pasos completados */}
          {completedSteps.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-4 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                Pasos completados
              </h3>
              <div className="grid gap-3">
                {completedSteps.map((step) => (
                  <div
                    key={step.id}
                    className="flex items-center p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center text-white mr-3">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-emerald-900">
                        {step.title}
                      </p>
                      <p className="text-xs text-emerald-700">
                        Completado exitosamente
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Acción de usuarios (siempre visible) */}
          <div className="pt-6 border-t border-gray-200">
            <div className="group relative overflow-hidden rounded-xl border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 p-5 transition-all duration-300 hover:shadow-lg hover:border-purple-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="relative flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white mr-4">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">
                    Gestionar usuarios
                  </h3>
                  <p className="text-purple-700 mb-4 text-sm leading-relaxed">
                    Agrega o administra los usuarios de tu empresa
                  </p>
                  <Link
                    href="/users/list"
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300"
                  >
                    Ir a usuarios
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estado resumido mejorado */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-emerald-500/10 rounded-full -translate-y-12 translate-x-12"></div>
          <div className="relative">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              Estado de configuración
            </h3>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <span className="block text-3xl font-bold bg-gradient-to-r from-purple-600 to-emerald-600 bg-clip-text text-transparent">
                  {completedSteps.length}/{configurationSteps.length - 1}
                </span>
                <span className="text-sm text-gray-500 font-medium">
                  Pasos completados
                </span>
              </div>
              <div className="flex-1 ml-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    Progreso total
                  </span>
                  <span className="text-sm font-bold text-purple-600">
                    {completionPercentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-emerald-500 h-3 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
