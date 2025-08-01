import React from "react";
import type { Metadata } from "next";
import {
  Store,
  CheckCircle,
  RefreshCw,
  Bell,
  ArrowRight,
  Mail,
  Phone,
} from "lucide-react";
import { Navbar } from "@/components";

import Link from "next/link";

// Este es el componente principal que se renderizará.
export default function App() {
  return (
    <div className="font-sans antialiased text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 min-h-screen max-w-screen">
      <Navbar />

      <main>
        {/* Sección principal (Hero) */}
        <section className="container mx-auto py-16 md:py-24 px-6 md:px-12 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 tracking-tight bg-gradient-to-r from-purple-600 via-violet-600 to-emerald-500 bg-clip-text text-transparent">
              Simplifica la gestión de cuotas de tus alumnos
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              CuotaFacil es la herramienta definitiva para escuelas y negocios
              que buscan automatizar y organizar sus cobros.
            </p>
            <Link
              href="/auth/new-account"
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold rounded-full shadow-xl hover:from-purple-600 hover:to-violet-700 transition-all duration-300 transform hover:scale-105"
            >
              Comienza gratis
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* Sección de características */}
        <section
          id="caracteristicas"
          className="bg-white dark:bg-gray-800 py-16 md:py-24 px-6 md:px-12"
        >
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              Características que amarás
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-600 transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-4 shadow-md">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  Gestión de Cobros sin Esfuerzo
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Organiza y da seguimiento a todas las cuotas de tus alumnos en
                  un solo lugar. Conoce quién ha pagado y quién no, de un solo
                  vistazo.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-600 transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-14 h-14 bg-purple-500 rounded-full flex items-center justify-center text-white mb-4 shadow-md">
                  <RefreshCw className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  Actualizaciones Automáticas
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Olvídate de las tareas manuales. Configura tus tarifas y deja
                  que CuotaFacil aplique los recargos por vencimiento de forma
                  automática.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-600 transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-14 h-14 bg-violet-600 rounded-full flex items-center justify-center text-white mb-4 shadow-md">
                  <Bell className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  Notificaciones por estado (Próximamente)
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Pronto podrás enviar recordatorios de pago y notificaciones
                  automáticas por el estado de cuenta a tus alumnos,
                  directamente desde la plataforma.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sección de Contacto */}
        <section
          id="contacto"
          className="bg-white dark:bg-gray-800 py-16 md:py-24 px-6 md:px-12 text-center"
        >
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              Contáctanos
            </h2>
            <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center space-y-8 md:space-y-0 sm:space-x-12">
              {/* Contenedor del Email */}
              <div className="flex flex-col items-center space-y-4">
                <Mail className="w-12 h-12 text-purple-600" />
                <div className="text-center">
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                    Email
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    cuotafacilbussiness@gmail.com
                  </p>
                </div>
              </div>
              {/* Contenedor del Teléfono */}
              <div className="flex flex-col items-center space-y-4">
                <Phone className="w-12 h-12 text-purple-600" />
                <div className="text-center">
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                    Teléfono
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    +54 9 385 595 6688
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sección CTA final */}
        <section className="bg-gray-100 dark:bg-gray-700 py-16 px-6 md:px-12">
          <div className="container mx-auto text-center max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
              ¿Cansado de la carga administrativa?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Hemos creado CuotaFacil para que la gestión de pagos no sea un
              dolor de cabeza. Olvida el estrés de las planillas de cálculo y
              los recordatorios manuales. Permite a tus alumnos ver su estado de
              cuenta en tiempo real y libera tiempo para lo que realmente
              importa: tu enseñanza y tu negocio.
            </p>
            <Link
              href="/auth/new-account"
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold rounded-full shadow-xl hover:from-purple-600 hover:to-violet-700 transition-all duration-300 transform hover:scale-105"
            >
              Comienza a simplificar tu gestión
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      {/* Pie de página */}
      <footer className="py-8 text-center text-gray-500 dark:text-gray-400">
        <p>
          &copy; {new Date().getFullYear()} CuotaFacil. Todos los derechos
          reservados.
        </p>
      </footer>
    </div>
  );
}
