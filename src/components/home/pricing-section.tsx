"use client";

import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type React from "react";

// --- Definición de Tipos y Datos (Proporcionados por ti) ---

export interface PlanOption {
  id: "basico_mensual" | "basico_anual" | "pro_mensual" | "pro_anual";
  name: string;
  price: string;
  originalPrice?: string;
  period: string;
  icon: React.ReactNode;
  popular?: boolean;
  features: string[];
  badge?: string;
  color: string;
  base: "basico" | "pro";
  frecuencia: "mensual" | "anual";
}

export const plans: PlanOption[] = [
  {
    id: "basico_mensual",
    name: "Plan Básico",
    price: "$10.000",
    period: "por mes",
    icon: <Sparkles className="w-6 h-6" />, // Cambié Gift por Sparkles para variar, pero puedes usar cualquier icono
    features: [
      "Hasta 1 administrador",
      "Usuarios ilimitados",
      "Tarifas personalizadas",
      "Recordatorios por email",
      "Reportes básicos",
    ],
    color: "from-blue-500 to-indigo-600",
    base: "basico",
    frecuencia: "mensual",
  },
  {
    id: "basico_anual",
    name: "Plan Básico Anual",
    price: "$100.000",
    originalPrice: "$120.000",
    period: "por año",
    icon: <Sparkles className="w-6 h-6" />,
    features: [
      "Hasta 1 administrador",
      "Usuarios ilimitados",
      "Recordatorios por email",
      "Reportes básicos",
      "Ahorra $20.000 (2 meses)",
    ],
    badge: "Ahorra 17%",
    color: "from-purple-500 to-violet-600",
    base: "basico",
    frecuencia: "anual",
  },
  {
    id: "pro_mensual",
    name: "Plan Pro",
    price: "$15.000",
    period: "por mes",
    icon: <Sparkles className="w-6 h-6" />,
    popular: true,
    features: [
      "Hasta 3 administradores",
      "Usuarios ilimitados",
      "Tarifas personalizadas",
      "Recordatorios por email",
      "Recordatorios automáticos por WhatsApp",
      "Prioridad en soporte",
    ],
    color: "from-green-500 to-emerald-600",
    base: "pro",
    frecuencia: "mensual",
  },
  {
    id: "pro_anual",
    name: "Plan Pro Anual",
    price: "$150.000",
    originalPrice: "$180.000",
    period: "por año",
    icon: <Sparkles className="w-6 h-6" />,
    popular: true,
    badge: "Ahorra 17%",
    features: [
      "Hasta 3 administradores",
      "Usuarios ilimitados",
      "Recordatorios automáticos por WhatsApp",
      "Recordatorios por email",
      "Prioridad en soporte",
      "Ahorra $30.000 (2 meses)",
    ],
    color: "from-green-500 to-emerald-600",
    base: "pro",
    frecuencia: "anual",
  },
];

// --- Componente ---

export function PricingSection() {
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
    <section ref={sectionRef} className="py-24 bg-background" id="precios">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">
              Precios simples
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
            Planes que se adaptan a{" "}
            <span className="text-primary">tu negocio</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Sin costos ocultos. Sin sorpresas. Comienza gratis y escala cuando
            lo necesites.
          </p>
        </div>

        {/* Pricing Cards - Grid adaptado para 4 columnas en desktop (2x2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-8 transition-all duration-700 ${
                plan.popular
                  ? `bg-gradient-to-b ${plan.color} text-white scale-[1.02] shadow-2xl z-10 border-transparent`
                  : "bg-card border border-border hover:border-primary/30 hover:shadow-xl"
              } ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Badge (Ahorra 17% u otro) */}
              {plan.badge && (
                <div className="absolute -top-3 right-4">
                  <span
                    className={`text-sm font-bold px-3 py-1 rounded-full shadow-lg ${
                      plan.popular
                        ? "bg-white/20 text-white backdrop-blur-sm"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan Header: Icon + Name + Description logic */}
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`p-3 rounded-xl ${
                    plan.popular
                      ? "bg-white/20 text-white"
                      : `bg-gradient-to-br ${plan.color} text-white`
                  }`}
                >
                  {plan.icon}
                </div>
                <div>
                  <h3
                    className={`text-xl font-bold ${plan.popular ? "text-white" : "text-foreground"}`}
                  >
                    {plan.name}
                  </h3>
                  {plan.popular && (
                    <span className="text-xs uppercase tracking-wider font-semibold text-white/80">
                      Recomendado
                    </span>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  {plan.originalPrice && (
                    <span
                      className={`text-sm line-through ${plan.popular ? "text-white/60" : "text-muted-foreground"}`}
                    >
                      {plan.originalPrice}
                    </span>
                  )}
                  <span
                    className={`text-4xl font-bold ${plan.popular ? "text-white" : "text-foreground"}`}
                  >
                    {plan.price}
                  </span>
                </div>
                <span
                  className={`text-sm ${plan.popular ? "text-white/80" : "text-muted-foreground"}`}
                >
                  {plan.period}
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check
                      className={`w-5 h-5 mt-0.5 flex-shrink-0 ${plan.popular ? "text-white" : "text-accent"}`}
                    />
                    <span
                      className={`text-sm ${plan.popular ? "text-white/90" : "text-muted-foreground"}`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                asChild
                className={`w-full py-6 rounded-xl font-medium transition-all hover:scale-[1.02] ${
                  plan.popular
                    ? "bg-white text-gray-900 hover:bg-white/90 shadow-md"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                <Link href={`/auth/new-account?planId=${plan.id}`}>
                  {plan.popular ? "Comenzar ahora" : "Elegir plan"}
                </Link>
              </Button>
            </div>
          ))}
        </div>

        {/* Trust note */}
        <p className="text-center text-sm text-muted-foreground mt-12 max-w-xl mx-auto">
          Todos los planes incluyen 14 días de prueba gratis. Cancela cuando
          quieras, sin compromisos ni preguntas.
        </p>
      </div>
    </section>
  );
}
