import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4">
      <div className="text-center max-w-md mx-auto p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-6xl font-bold text-indigo-600 mb-4">Upss</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Negocio no encontrado
        </h2>
        <p className="text-gray-600 mb-6">
          No se encontró el nombre del negocio que buscas
        </p>

        <Link
          href="/"
          className="inline-block px-6 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
        >
          Ir a inicio
        </Link>
      </div>
    </div>
  );
}
