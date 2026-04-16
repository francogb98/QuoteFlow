"use client";

import { UserPlus, Settings, Bell, BarChart2, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Crea tu cuenta",
    description:
      "Regístrate en menos de 2 minutos. Sin tarjeta de crédito, sin compromisos.",
  },
  {
    number: "02",
    icon: Settings,
    title: "Configura tus cuotas",
    description:
      "Define tus planes de pago, fechas de vencimiento y recargos automáticos.",
  },
  {
    number: "03",
    icon: Bell,
    title: "Activa notificaciones",
    description:
      "Configura notificaciones automáticas por email para enviar recordatorios de pago a tus clientes.",
  },
  {
    number: "04",
    icon: BarChart2,
    title: "Gestiona y crece",
    description:
      "Visualiza reportes, cobra más rápido y enfócate en hacer crecer tu negocio.",
  },
];

export function HowItWorksSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-background relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 via-transparent to-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full mb-6">
            <span className="text-sm font-medium text-accent">
              Cómo funciona
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
            Comienza en <span className="text-primary">4 simples pasos</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Configurar CuotaFacil es rápido y sencillo. Estarás cobrando en
            minutos.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`relative transition-all duration-700 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[60%] w-full">
                    <div className="h-0.5 bg-gradient-to-r from-primary/40 to-transparent" />
                    <ArrowRight className="absolute right-0 -top-2 w-4 h-4 text-primary/40" />
                  </div>
                )}

                {/* Step card */}
                <div className="relative group">
                  {/* Number badge */}
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg z-10">
                    <span className="text-xs font-bold text-primary-foreground">
                      {step.number}
                    </span>
                  </div>

                  <div className="bg-card rounded-2xl p-6 border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-xl group-hover:-translate-y-1">
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <step.icon className="w-7 h-7 text-primary" />
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
