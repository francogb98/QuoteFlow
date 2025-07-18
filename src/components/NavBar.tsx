"use client";

import { Button } from "@/components/ui/button";
import { Store, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import { FaStoreAlt } from "react-icons/fa";

export function Navbar() {
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full opacity-80"></div>
            </div>
            <div className="hidden sm:block">
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                PayConsult
              </h2>
              <p className="text-xs text-gray-500 -mt-1">Gestión de Pagos</p>
            </div>
          </Link>

          {/* Navigation Buttons */}
          <div className="flex items-center space-x-3">
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

            <Button
              size="sm"
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              asChild
            >
              <Link
                href="/auth/new-account"
                className="flex items-center space-x-2"
              >
                <FaStoreAlt className="w-4 h-4" />
                <span className="hidden sm:inline">Registrar Empresa</span>
                <span className="sm:hidden">Registrar Empresa</span>
              </Link>
            </Button>

            {/* Mobile menu button for login */}
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
          </div>
        </div>
      </div>
    </nav>
  );
}
