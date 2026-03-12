"use client";

import { ArrowRight, Play, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/5 via-transparent to-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-full mb-8 transition-all duration-700 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span className="text-sm font-medium text-foreground">
              Nuevo: Notificaciones automáticas por WhatsApp
            </span>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </div>

          {/* Main Heading */}
          <h1
            className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 transition-all duration-700 delay-100 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <span className="text-foreground">Gestiona tus cobros </span>
            <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent animate-gradient">
              sin esfuerzo
            </span>
          </h1>

          {/* Subheading */}
          <p
            className={`text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed transition-all duration-700 delay-200 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            La plataforma todo-en-uno para escuelas, academias y negocios que
            automatiza el cobro de cuotas, envía notificaciones por WhatsApp y
            email, y te ahorra horas de trabajo administrativo.
          </p>

          {/* CTA Buttons */}
          {/* <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 transition-all duration-700 delay-300 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <Link href="/auth/new-account">
                Comienza gratis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-6 text-lg rounded-full border-border hover:bg-secondary transition-all"
            >
              <Play className="mr-2 w-5 h-5" />
              Ver demo
            </Button>
          </div> */}

          {/* Trust indicators */}
          <div
            className={`flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground transition-all duration-700 delay-400 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-accent" />
              <span>Sin tarjeta de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-accent" />
              <span>Configuración en 5 min</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-accent" />
              <span>Soporte 24/7</span>
            </div>
          </div>
        </div>

        {/* App Preview */}
        <div
          className={`mt-16 max-w-5xl mx-auto transition-all duration-1000 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="relative">
            {/* Glow effect behind the image */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-2xl opacity-50" />

            {/* App mockup */}
            <div className="relative bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-secondary/50 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-muted rounded-md px-3 py-1.5 text-sm text-muted-foreground max-w-md mx-auto">
                    app.cuotafacil.com/dashboard
                  </div>
                </div>
              </div>

              {/* Dashboard preview content */}
              <div className="p-6 bg-gradient-to-br from-card via-card to-secondary/20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Stats cards */}
                  <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
                    <p className="text-sm text-muted-foreground mb-1">
                      Cobros del mes
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      $847,500
                    </p>
                    <p className="text-xs text-accent mt-1">
                      +12.5% vs mes anterior
                    </p>
                  </div>
                  <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
                    <p className="text-sm text-muted-foreground mb-1">
                      Alumnos activos
                    </p>
                    <p className="text-2xl font-bold text-foreground">1,234</p>
                    <p className="text-xs text-accent mt-1">98% al día</p>
                  </div>
                  <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
                    <p className="text-sm text-muted-foreground mb-1">
                      Notificaciones enviadas
                    </p>
                    <p className="text-2xl font-bold text-foreground">3,891</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Este mes
                    </p>
                  </div>
                </div>

                {/* Table preview */}
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="font-medium text-foreground">
                      Pagos recientes
                    </p>
                  </div>
                  <div className="divide-y divide-border">
                    {[
                      {
                        name: "María García",
                        amount: "$15,000",
                        status: "Pagado",
                        statusColor: "text-accent",
                      },
                      {
                        name: "Juan Rodríguez",
                        amount: "$15,000",
                        status: "Pendiente",
                        statusColor: "text-yellow-500",
                      },
                      {
                        name: "Ana Martínez",
                        amount: "$15,000",
                        status: "Pagado",
                        statusColor: "text-accent",
                      },
                    ].map((row, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {row.name[0]}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {row.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-foreground">
                            {row.amount}
                          </span>
                          <span
                            className={`text-sm font-medium ${row.statusColor}`}
                          >
                            {row.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
