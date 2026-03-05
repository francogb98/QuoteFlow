"use client";

import { ShareCompanyLink } from "./ui/SharedCompanyLink";
import { Rol } from "@prisma/client";
import { Sparkles } from "lucide-react";

interface BienvenidaProps {
  user?: {
    nombre?: string;
    rol: Rol;
    empresa?: {
      nombre?: string;
    };
  };
  link?: string;
}

export default function Bienvenida({ user, link }: BienvenidaProps) {
  const userName = user?.nombre || "Usuario";
  const companyName = user?.empresa?.nombre || "Mi Empresa";
  const shareLink = link || "http://localhost:3000";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  return (
    <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Welcome Message */}
          <div className="flex-1" data-tour="welcome">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              <p className="text-sm font-medium text-gray-600">
                {getGreeting()}
              </p>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              {userName}
            </h1>
            <p className="text-sm text-gray-500 mt-1">{companyName}</p>
          </div>

          {/* Share Link */}
          <div data-tour="share-link">
            <ShareCompanyLink companyName={companyName} link={shareLink} />
          </div>
        </div>
      </div>
    </div>
  );
}
