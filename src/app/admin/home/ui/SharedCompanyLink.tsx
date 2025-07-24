"use client";

import { Copy, Check, Share2, ExternalLink, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  companyName: string;
  link: string;
}

export function ShareCompanyLink({ companyName, link }: Props) {
  const [copied, setCopied] = useState(false);
  const baseUrl = link || "http://localhost:3000";
  const companySlug = companyName.replace(/\s+/g, "-");
  const fullLink = `${baseUrl}/${companySlug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullLink);
    setCopied(true);
    toast.success("¡Enlace copiado al portapapeles!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${companyName} - Portal de Pagos`,
          text: "Accede a tu portal de pagos",
          url: fullLink,
        });
      } catch (error) {
        // Si el usuario cancela, no hacer nada
        if (error instanceof Error && error.name !== "AbortError") {
          handleCopy(); // Fallback a copiar
        }
      }
    } else {
      handleCopy(); // Fallback para navegadores que no soportan Web Share API
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-purple-100 relative overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-purple-500/10 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/5 to-emerald-500/5 rounded-full translate-y-12 -translate-x-12"></div>

      <div className="relative">
        {/* Header */}
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mr-4">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              Link para cobrar tus cuotas
              <Sparkles className="w-4 h-4 ml-2 text-emerald-500" />
            </h2>
            <p className="text-sm text-gray-500">
              Comparte este enlace con tus usuarios
            </p>
          </div>
        </div>

        {/* Link container */}
        <div className="bg-gradient-to-r from-purple-50 to-emerald-50 rounded-xl p-4 border-2 border-purple-200 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center mb-2">
                <ExternalLink className="w-4 h-4 text-purple-500 mr-2" />
                <span className="text-sm font-medium text-purple-700">
                  Tu enlace personalizado
                </span>
              </div>
              <div className="bg-white rounded-lg p-3 border border-purple-200 overflow-x-auto">
                <code className="text-sm text-gray-700 font-mono break-all">
                  {fullLink}
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                ¡Copiado!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copiar enlace
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </button>
        </div>

        {/* Info adicional */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <span className="text-white text-xs font-bold">i</span>
            </div>
            <div>
              <p className="text-sm text-blue-800 font-medium mb-1">
                ¿Cómo funciona?
              </p>
              <p className="text-xs text-blue-700 leading-relaxed">
                Tus usuarios podrán acceder a este enlace para ver y pagar sus
                cuotas pendientes. El enlace es único para tu empresa y siempre
                estará disponible.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
