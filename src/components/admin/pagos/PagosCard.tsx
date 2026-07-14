"use client";
import { useState } from "react";
import { EstadoPago } from "@prisma/client";
import Image from "next/image";
import {
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Edit,
  ZoomIn,
  X,
} from "lucide-react";
import { EditPaymentStatusModal } from "./EditPaymentStatusModal";

interface Props {
  pago: {
    id: string;
    monto: number;
    fecha: Date;
    comprobante: string | null;
    estado: EstadoPago;
  };
  userName: string;
}

const estadoStyles = {
  PENDIENTE: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
  PAGADO: "bg-green-50 text-green-700 ring-green-600/20",
  RECHAZADO: "bg-red-50 text-red-700 ring-red-600/20",
  VENCIDO: "bg-gray-50 text-gray-700 ring-gray-600/20",
};

const estadoIcons = {
  PENDIENTE: <Clock className="w-4 h-4" />,
  PAGADO: <CheckCircle className="w-4 h-4" />,
  RECHAZADO: <XCircle className="w-4 h-4" />,
  VENCIDO: <Clock className="w-4 h-4" />,
};

function isValidImageUrl(url: string | null): boolean {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    // Opcional: restringir a Cloudinary
    if (!parsed.hostname.includes("res.cloudinary.com")) return false;
    return true;
  } catch {
    return false;
  }
}

export const PagosCard = ({ pago, userName }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false); // Nuevo estado para el modal de la imagen

  const stateStyle =
    //@ts-ignore
    estadoStyles[pago.estado] || "bg-gray-50 text-gray-700 ring-gray-600/20";
  //@ts-ignore
  const stateIcon = estadoIcons[pago.estado] || (
    <FileText className="w-4 h-4" />
  );

  const isRejectedAndHasVoucher =
    pago.estado === "RECHAZADO" && pago.comprobante;

  return (
    <>
      <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 p-6 flex flex-col space-y-4 transition-all hover:scale-[1.02] hover:shadow-xl">
        <div className="absolute top-4 right-4 flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset">
          <span className={`flex text-[10px] items-center gap-1 ${stateStyle}`}>
            {stateIcon}
            <span>{pago.estado}</span>
          </span>
        </div>

        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium text-gray-500">Monto del pago</p>
          <p className="text-xl font-bold text-purple-600">
            ${pago.monto.toLocaleString("es-AR")}
          </p>
        </div>

        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium text-gray-500">Usuario</p>
          <p className="text-md font-semibold text-gray-800">{userName}</p>
        </div>

        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium text-gray-500">Fecha</p>
          <p className="text-md font-semibold text-gray-800">
            {pago.fecha.toLocaleDateString("es-AR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        {isRejectedAndHasVoucher && (
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-gray-500">Motivo</p>
            {/* @ts-ignore */}
            <p className="text-md font-semibold text-gray-800">{pago.motivo}</p>
          </div>
        )}

        {pago.comprobante && isValidImageUrl(pago.comprobante) ? (
          <div
            className="relative w-full h-48 rounded-xl border border-gray-200 group cursor-pointer"
            onClick={() => setIsImageModalOpen(true)}
          >
            <Image
              src={pago.comprobante}
              alt={`Comprobante de pago ${pago.id}`}
              layout="fill"
              objectFit="cover"
              className="rounded-xl transition-transform duration-300"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-transparent bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
              <ZoomIn className="w-8 h-8 text-white" />
            </div>
          </div>
        ) : pago.comprobante ? (
          <div className="w-full h-48 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-400 text-sm">
              Comprobante no es una imagen válida
            </p>
          </div>
        ) : (
          <div className="w-full h-48 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-400 text-sm">Sin comprobante</p>
          </div>
        )}

        {pago.comprobante && (
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-purple-100 text-purple-600 font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-purple-200 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Editar Estado
            </button>
          </div>
        )}
      </div>

      <EditPaymentStatusModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        pagoId={pago.id}
        userName={userName}
      />

      {/* Nuevo componente de modal para la imagen */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-md"
          onClick={() => setIsImageModalOpen(false)} // Cierra el modal al hacer clic fuera de la imagen
        >
          <div className="relative w-full max-w-2xl max-h-full">
            {/* una X arriba a la derecha para que se cierre */}
            <button
              className="absolute top-2 right-2 text-white cursor-pointer hover:text-purple-500"
              onClick={() => setIsImageModalOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <Image
              src={pago.comprobante!}
              alt="Comprobante de pago ampliado"
              layout="responsive"
              width={1000}
              height={1000}
              className="rounded-lg"
              onClick={(e) => e.stopPropagation()} // Evita que el clic en la imagen cierre el modal
            />
          </div>
        </div>
      )}
    </>
  );
};
