import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-gray-50 dark:bg-gray-900 px-4">
      {/* Título y subtítulo con la misma estética de tu landing page */}
      <div className="max-w-4xl mx-auto">
        <h1 className="text-9xl md:text-[12rem] font-extrabold leading-none tracking-tight mb-4 bg-gradient-to-r from-purple-600 via-violet-600 to-emerald-500 bg-clip-text text-transparent">
          404
        </h1>
        <p className="text-3xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-6">
          Página no encontrada
        </p>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
          Lo sentimos, la página que estás buscando no existe o se ha movido.
          Puedes volver a la página principal.
        </p>

        {/* Botón para volver a la página principal, con el mismo estilo */}
        <Link
          href="/"
          className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold rounded-full shadow-xl hover:from-purple-600 hover:to-violet-700 transition-all duration-300 transform hover:scale-105"
        >
          <ArrowLeft className="mr-2 w-5 h-5" />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
