"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AuthError]", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Error de autenticación
        </h1>
        <p className="text-muted-foreground mb-6">
          No se pudo completar la operación. Por favor, intenta nuevamente.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/auth/login">
              <LogIn className="w-4 h-4" />
              Ir al login
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
