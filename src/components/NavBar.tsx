"use client";

import { Button } from "@/components/ui/button";
import { QuoteFlowLogo } from "@/lib/Logo";
import { LogIn } from "lucide-react";
import Link from "next/link";
import { FaStoreAlt } from "react-icons/fa";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Renderizar una versión simple durante SSR
    return (
      <nav className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            Cargando Pagina
          </div>
        </div>
      </nav>
    );
  }
  const isLoginPage = pathname === "/auth/login";
  const isRegisterPage = pathname === "/auth/new-account";

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <QuoteFlowLogo size="md" variant="full" />
          </Link>

          {/* Navigation Buttons */}
          <div className="flex items-center space-x-0 md:space-x-3">
            {isRegisterPage && (
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex items-center space-x-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                asChild
              >
                <Link href="/auth/login">
                  <LogIn className="w-4 h-4" />
                  <span>Ingresar</span>
                </Link>
              </Button>
            )}

            {isLoginPage && (
              <Button
                size="sm"
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                asChild
              >
                <Link
                  href="/auth/new-account"
                  className="flex items-center space-x-1"
                >
                  <FaStoreAlt className="w-4 h-4" />
                  <span className="hidden sm:inline">Registrar Empresa</span>
                </Link>
              </Button>
            )}

            {/* Mobile menu button for login */}
            {isRegisterPage && (
              <Button
                variant="ghost"
                size="sm"
                className="sm:hidden text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                asChild
              >
                <Link href="/auth/login">
                  <LogIn className="w-4 h-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
