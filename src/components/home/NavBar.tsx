"use client";

import { Button } from "@/components/ui/button";
import { LogIn, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "#caracteristicas", label: "Características" },
  { href: "#precios", label: "Precios" },
  { href: "#contacto", label: "Contacto" },
];

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!mounted) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex justify-between items-center px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-lg font-bold text-white">C</span>
            </div>
            <span className="text-xl font-bold text-foreground">
              CuotaFacil
            </span>
          </Link>
        </div>
      </nav>
    );
  }

  const isLoginPage = pathname === "/auth/login";
  const isRegisterPage = pathname === "/auth/new-account";
  const isRootPage = pathname === "/";

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto flex justify-between items-center px-4 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-lg font-bold text-white">C</span>
            </div>
            <span className="text-xl font-bold text-foreground">
              CuotaFacil
            </span>
          </Link>

          {/* Desktop Navigation */}
          {isRootPage && (
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {(isRegisterPage || isRootPage) && (
              <Button
                asChild
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                <Link href="/auth/login">
                  <LogIn className="w-4 h-4 mr-2" />
                  Iniciar Sesión
                </Link>
              </Button>
            )}
            {(isLoginPage || isRootPage) && (
              <Button
                asChild
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6"
              >
                <Link href="/auth/new-account">Crear Cuenta</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-background border-t border-border">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              {isRootPage &&
                navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground py-2"
                  >
                    {link.label}
                  </a>
                ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {(isRegisterPage || isRootPage) && (
                  <Button asChild variant="outline" className="w-full">
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Iniciar Sesión
                    </Link>
                  </Button>
                )}
                {(isLoginPage || isRootPage) && (
                  <Button
                    asChild
                    className="w-full bg-primary text-primary-foreground"
                  >
                    <Link
                      href="/auth/new-account"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Crear Cuenta
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-[72px]" />
    </>
  );
}
