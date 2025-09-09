"use client";

import { Copy, Check, Share2 } from "lucide-react";
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
        if (error instanceof Error && error.name !== "AbortError") {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="w-full md:w-[350px] flex items-center justify-between gap-2 p-3 border border-emerald-200 rounded-lg bg-gradient-to-r from-emerald-50 to-purple-50 shadow-sm hover:border-purple-300 transition-all">
      <div className="flex items-center gap-2 min-w-0">
        <Share2 className="w-4 h-4 text-emerald-600" />
        <span className="text-sm font-medium text-emerald-800 truncate">
          {fullLink}
        </span>
      </div>
      <div className="flex-shrink-0 flex gap-1.5">
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-md text-emerald-600 hover:bg-purple-100 transition-colors"
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-500" />
          ) : (
            <Copy className="h-4 w-4 cursor-pointer" />
          )}
        </button>
        <button
          onClick={handleShare}
          className="p-1.5 rounded-md text-emerald-600 hover:bg-purple-100 transition-colors"
        >
          <Share2 className="h-4 w-4 cursor-pointer" />
        </button>
      </div>
    </div>
  );
}
