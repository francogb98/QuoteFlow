"use client";

import { Mail, Users, CreditCard, BarChart3, Smartphone } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const features = [
  {
    icon: Mail,
    title: "Notificaciones automáticas",
    description:
      "Envía recordatorios automáticos de pago por email a tus clientes. Aumenta tu tasa de cobro y reduce la morosidad.",
    color: "bg-blue-500/10 text-blue-600",
    iconBg: "bg-blue-500",
  },
  {
    icon: Users,
    title: "Múltiples Administradores",
    description:
      "Crea diferentes roles y permisos. Secretarios, cobradores y directivos pueden acceder según sus necesidades.",
    color: "bg-primary/10 text-primary",
    iconBg: "bg-primary",
  },
  {
    icon: CreditCard,
    title: "Gestión de Cuotas",
    description:
      "Configura planes de pago flexibles, cuotas mensuales, recargos automáticos y descuentos por pronto pago.",
    color: "bg-accent/10 text-accent",
    iconBg: "bg-accent",
  },
  {
    icon: BarChart3,
    title: "Reportes Detallados",
    description:
      "Visualiza el estado de tus cobranzas con gráficos claros. Exporta a Excel y toma decisiones informadas.",
    color: "bg-orange-500/10 text-orange-600",
    iconBg: "bg-orange-500",
  },
  {
    icon: Smartphone,
    title: "Portal para Alumnos",
    description:
      "Tus clientes pueden ver su estado de cuenta, historial de pagos y recibos desde cualquier dispositivo.",
    color: "bg-pink-500/10 text-pink-600",
    iconBg: "bg-pink-500",
  },
];

export function FeaturesSection() {
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
    <section ref={sectionRef} className="py-24 bg-card" id="caracteristicas">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
            <span className="text-sm font-medium text-primary">
              Características
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
            Todo lo que necesitas para{" "}
            <span className="text-primary">automatizar tus cobros</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Herramientas poderosas diseñadas para simplificar la administración
            de tu negocio y mejorar la comunicación con tus clientes.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`group relative bg-background rounded-2xl p-6 border border-border hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Hover gradient */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {[
            { value: "+500", label: "Instituciones" },
            { value: "98%", label: "Tasa de cobro" },
            { value: "50K+", label: "Alumnos gestionados" },
            { value: "24/7", label: "Soporte" },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className={`text-center transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: `${600 + index * 100}ms` }}
            >
              <p className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
