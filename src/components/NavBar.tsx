"use client";

import { Button } from "@/components/ui/button";
import { QuoteFlowLogo } from "@/lib/Logo";
import { LogIn, Store } from "lucide-react";
import Link from "next/link";
import { FaStoreAlt } from "react-icons/fa";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Renderizar una versión simple durante SSR
    return (
      <nav className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50 shadow-md">
        <div className="container mx-auto flex justify-between items-center p-4">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/IconoOriginal.ico"
              alt="Logo"
              width={100}
              height={100}
              priority
              className="w-10 h-10 sm:w-12 sm:h-12"
            />
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-emerald-500 bg-clip-text text-transparent">
              CuotaFacil
            </span>
          </Link>
        </div>
      </nav>
    );
  }
  const isLoginPage = pathname === "/auth/login";
  const isRegisterPage = pathname === "/auth/new-account";

  return (
    <nav className="p-4 bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo de la aplicación, usando el icono */}
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/IconoOriginal.ico"
            alt="Logo"
            width={100}
            height={100}
            priority
            className="w-10 h-10 sm:w-12 sm:h-12"
          />
          <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-emerald-500 bg-clip-text text-transparent">
            CuotaFacil
          </span>
        </Link>
        {/* Enlaces de navegación */}
        <ul className="flex space-x-2 sm:space-x-4 items-center">
          {!isLoginPage && (
            <li>
              <Link href="/auth/login" passHref>
                <Button
                  variant="ghost"
                  className="text-purple-600 hover:bg-purple-100 p-2 sm:px-4 sm:py-2"
                >
                  <LogIn className="w-5 h-5 sm:mr-2" />
                  <span className="hidden sm:inline">Iniciar Sesión</span>
                </Button>
              </Link>
            </li>
          )}
          {!isRegisterPage && (
            <li>
              <Link href="/auth/new-account" passHref>
                <Button className="bg-emerald-600 text-white hover:bg-emerald-700 p-2 sm:px-4 sm:py-2">
                  <FaStoreAlt className="w-5 h-5 sm:mr-2" />
                  <span className="hidden sm:inline">Crear Cuenta</span>
                </Button>
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
