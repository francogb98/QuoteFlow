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
    <div className="w-full shrink-0 md:w-auto">
      <div className="flex items-center justify-between gap-2 rounded-md border border-emerald-200 bg-gradient-to-r from-emerald-50 to-purple-50 px-2.5 py-1 shadow-sm transition-all hover:border-purple-300">
        <div className="flex min-w-0 items-center gap-1.5">
          <Share2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
          <span className="truncate text-xs font-medium text-emerald-800">
            {fullLink}
          </span>
        </div>

        <div className="flex shrink-0 gap-1">
          <button
            onClick={handleCopy}
            className="rounded p-1 text-emerald-600 transition-colors hover:bg-purple-100"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5 cursor-pointer" />
            )}
          </button>

          <button
            onClick={handleShare}
            className="rounded p-1 text-emerald-600 transition-colors hover:bg-purple-100"
          >
            <Share2 className="h-3.5 w-3.5 cursor-pointer" />
          </button>
        </div>
      </div>
    </div>
  );
}
