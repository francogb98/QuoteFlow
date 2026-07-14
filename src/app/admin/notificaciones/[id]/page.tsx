// Archivo: app/admin/notificaciones/[id]/page.tsx
import { obtenerNotificacionPorId } from "@/actions/admin/notificaciones/notificaciones";
import {
  marcarNotificacionComoLeida,
  eliminarNotificacion,
} from "@/actions/admin/notificaciones/notificaciones";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { FaTrash, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import Link from "next/link";
import { FileText, Receipt } from "lucide-react";

interface NotificacionPageProps {
  params: Promise<{
    id: string;
  }>;
}

const getIconForType = (tipo: string) => {
  switch (tipo) {
    case "PAGO_CONFIRMADO":
    case "COMPROBANTE_APROBADO":
      // Verde del logo del panel de admin
      return <FaCheckCircle className="text-green-600 text-3xl" />;
    case "PAGO_VENCIDO":
    case "COMPROBANTE_RECHAZADO":
      // Rojo para errores
      return <FaExclamationCircle className="text-red-500 text-3xl" />;
    case "COMPROBANTE_SUBIDO":
      // Ícono de dólar con el color primario
      return <FileText className="text-purple-600 text-3xl" />;
    default:
      // Púrpura/Violeta para notificaciones generales del sistema
      return <FaExclamationCircle className="text-purple-600 text-3xl" />;
  }
};

export default async function NotificacionPage({
  params,
}: NotificacionPageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const resp = await obtenerNotificacionPorId(id);

  if (!resp.success || !resp.notificacion) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md">
        <p className="text-xl font-semibold text-gray-700">
          No se encontró la notificación o no tienes permisos.
        </p>
      </div>
    );
  }

  const notificacion = resp.notificacion;

  if (!notificacion.leida) {
    await marcarNotificacionComoLeida(notificacion.id);
  }

  const handleEliminar = async () => {
    "use server";
    await eliminarNotificacion(notificacion.id);
    revalidatePath("/admin/notificaciones");
  };

  let profileUrl = `/admin/users/${notificacion.usuarioId}`;

  let pagoUrl = "";
  if (notificacion.tipo === "COMPROBANTE_SUBIDO" && notificacion.entidadId) {
    pagoUrl = `/admin/pagos/${notificacion.entidadId}`;
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden border border-purple-100">
        <div className="p-6 sm:p-8">
          <div className="flex items-center space-x-4 mb-4">
            {getIconForType(notificacion.tipo)}
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              {notificacion.titulo}
            </h1>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Recibida el{" "}
            {new Date(notificacion.fechaCreacion).toLocaleDateString("es-AR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
          <div className="prose max-w-none text-gray-700 leading-relaxed">
            <p className="text-lg">{notificacion.mensaje}</p>
          </div>
        </div>

        <div className="bg-purple-50 px-6 py-4 sm:flex sm:justify-between sm:items-center border-t border-purple-100 flex-wrap">
          <div className="flex items-center space-x-4 flex-wrap">
            {/* Botón de Perfil */}
            {profileUrl && (
              <Link
                href={profileUrl}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 transform hover:scale-105 my-2"
              >
                Ver Perfil
              </Link>
            )}

            {/* Botón de Ver Pago */}
            {pagoUrl && (
              <Link
                href={pagoUrl}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 transform hover:scale-105 my-2"
              >
                <FileText className="mr-2" /> Ver Pago
              </Link>
            )}
          </div>

          <form action={handleEliminar}>
            <button
              type="submit"
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 transform hover:scale-105"
            >
              <FaTrash className="mr-2" /> Eliminar Notificación
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
