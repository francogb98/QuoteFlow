"use client";

import { ShareCompanyLink } from "./ui/SharedCompanyLink";
import { Rol } from "@prisma/client";

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

  return (
    <div className="bg-background">
      <main className="container mx-auto px-4 space-y-2">
        <div className="flex justify-end" data-tour="share-link">
          <ShareCompanyLink companyName={companyName} link={shareLink} />
        </div>
        <div className="flex-1 text-center mb-4" data-tour="welcome">
          <h2 className="text-xl md:text-3xl font-bold mb-2 bg-linear-to-r from-emerald-600 to-purple-600 bg-clip-text text-transparent">
            ¡Bienvenido {userName}!
          </h2>
        </div>
      </main>
    </div>
  );
}
