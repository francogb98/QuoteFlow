import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  Settings,
  UserPlus,
  CreditCard,
  CheckCircle,
  Info,
} from "lucide-react"; // Importa iconos de lucide-react
import Link from "next/link"; // Importa Link para los botones

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) redirect("/auth/login");

  const user = session.user;

  // Determinar el estado de los pasos
  const isMercadoPagoConfigured = !!user.claveMercadoPago;
  const isTariffConfigured = !!user.configuracionTarifa; // Asume que configuracionTarifa es null si no está configurada

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Bienvenido, <span className="text-indigo-600">{user.name}</span>{" "}
            {/* Usar user.name de la sesión */}
          </h1>
          <p className="text-gray-500 mt-2 text-sm md:text-base">
            Configura tu cuenta para comenzar a usar la plataforma
          </p>
        </div>

        {/* Pasos a seguir */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Settings className="mr-2 text-indigo-500" />
            Configuración inicial
          </h2>
          <div className="space-y-5">
            {/* Paso 1 - Sesión iniciada (siempre completado aquí) */}
            <div className="flex items-start p-3 rounded-lg bg-green-50 border border-green-100">
              <div className="flex-shrink-0 mt-1">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Sesión iniciada
                </h3>
                <p className="text-sm text-green-600 mt-1">
                  Has accedido correctamente al sistema
                </p>
              </div>
            </div>

            {/* Paso 2 - Pagos */}
            <div
              className={`flex items-start p-3 rounded-lg ${
                isMercadoPagoConfigured
                  ? "bg-green-50 border-green-100"
                  : "bg-blue-50 border-blue-100"
              }`}
            >
              <div className="flex-shrink-0 mt-1">
                {isMercadoPagoConfigured ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <CreditCard className="h-5 w-5 text-blue-500" />
                )}
              </div>
              <div className="ml-3 flex-1">
                <h3
                  className={`text-sm font-medium ${
                    isMercadoPagoConfigured ? "text-green-800" : "text-blue-800"
                  }`}
                >
                  Configuración de pagos
                </h3>
                <p
                  className={`text-sm mt-1 ${
                    isMercadoPagoConfigured ? "text-green-600" : "text-blue-600"
                  }`}
                >
                  {isMercadoPagoConfigured
                    ? "Tu cuenta de Mercado Pago está conectada."
                    : "Conecta tu cuenta de Mercado Pago para recibir pagos."}
                </p>
                {!isMercadoPagoConfigured && (
                  <div className="mt-3">
                    <Link
                      href="/profile/mercadopago" // Asume esta ruta para configurar MP
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      Configurar ahora
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Paso 3 - Tarifas */}
            <div
              className={`flex items-start p-3 rounded-lg ${
                isTariffConfigured
                  ? "bg-green-50 border-green-100"
                  : "bg-amber-50 border-amber-100"
              }`}
            >
              <div className="flex-shrink-0 mt-1">
                {isTariffConfigured ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Info className="h-5 w-5 text-amber-500" />
                )}
              </div>
              <div className="ml-3 flex-1">
                <h3
                  className={`text-sm font-medium ${
                    isTariffConfigured ? "text-green-800" : "text-amber-800"
                  }`}
                >
                  Configurar tarifas
                </h3>
                <p
                  className={`text-sm mt-1 ${
                    isTariffConfigured ? "text-green-600" : "text-amber-600"
                  }`}
                >
                  {isTariffConfigured
                    ? "Tus planes de suscripción y precios están establecidos."
                    : "Establece tus planes de suscripción y precios."}
                </p>
                {!isTariffConfigured && (
                  <div className="mt-3">
                    <Link
                      href="/profile/tariffs" // Asume esta ruta para configurar tarifas
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-amber-600 hover:bg-amber-700 transition-colors"
                    >
                      Definir tarifas
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Paso 4 - Usuarios */}
            <div className="flex items-start p-3 rounded-lg bg-purple-50 border border-purple-100">
              <div className="flex-shrink-0 mt-1">
                <UserPlus className="h-5 w-5 text-purple-500" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-purple-800">
                  Agregar usuarios
                </h3>
                <p className="text-sm text-purple-600 mt-1">
                  Crea o importa tus primeros usuarios/clientes
                </p>
                <div className="mt-3">
                  <Link
                    href="/users/list" // Asume esta ruta para gestionar usuarios
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                  >
                    Gestionar usuarios
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional (mantener o ajustar según necesidad) */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Estado */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
              <CheckCircle className="mr-2 text-indigo-500" />
              Progreso
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center">
                <div
                  className={`h-2 w-2 rounded-full mr-2 ${
                    isMercadoPagoConfigured ? "bg-green-500" : "bg-gray-300"
                  }`}
                ></div>
                <span className="text-gray-600">Pagos configurados</span>
              </div>
              <div className="flex items-center">
                <div
                  className={`h-2 w-2 rounded-full mr-2 ${
                    isTariffConfigured ? "bg-green-500" : "bg-gray-300"
                  }`}
                ></div>
                <span className="text-gray-600">Tarifas establecidas</span>
              </div>
            </div>
          </div>
          {/* Puedes añadir más tarjetas de información aquí */}
        </div>
      </div>
    </div>
  );
}
