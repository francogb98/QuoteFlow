"use client";

import Image from "next/image";
import { X } from "lucide-react";

interface Props {
  pago: any | null;
  onClose: () => void;
  onEditStatus: (pago: any) => void;
}

export function ComprobanteModal({ pago, onClose, onEditStatus }: Props) {
  if (!pago) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-2xl w-full p-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
        >
          <X />
        </button>

        <Image
          src={pago.comprobante}
          alt="Comprobante"
          width={1000}
          height={1000}
          className="rounded-lg"
        />

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => onEditStatus(pago)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg"
          >
            Aprobar / Rechazar
          </button>
        </div>
      </div>
    </div>
  );
}
