"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTour } from "./use-tour";
import { X, ArrowRight, ArrowLeft } from "lucide-react";

const tourSteps = [
  {
    target: '[data-tour="welcome"]',
    title: "¡Bienvenido a tu aplicación!",
    content:
      "Esta es tu página principal donde puedes acceder a todas las funcionalidades. Empecemos el recorrido.",
    position: "bottom" as const,
  },
  {
    target: '[data-tour="share-link"]',
    title: "Compartir tu Empresa",
    content:
      "Aquí puedes copiar y compartir el enlace de tu empresa con tus clientes.",
    position: "left" as const,
  },
  {
    target: '[data-tour="notifications"]',
    title: "Notificaciones",
    content:
      "Aquí verás todas tus notificaciones importantes. Mantente al día con las actualizaciones.",
    position: "bottom" as const,
  },
  {
    target: '[data-tour="search"]',
    title: "Buscar Usuarios",
    content:
      "Encuentra rápidamente a tus usuarios usando la búsqueda avanzada.",
    position: "bottom" as const,
  },
  {
    target: '[data-tour="modelo-cobro"]',
    title: "Modelo de Cobro",
    content:
      "Selecciona cómo quieres cobrar a tus clientes: Mercado Pago o comprobante.",
    position: "top" as const,
  },
  {
    target: '[data-tour="tarifas"]',
    title: "Tarifas",
    content:
      "Gestiona las tarifas de tu negocio creando diferentes tipos según tus necesidades.",
    position: "top" as const,
  },
  {
    target: '[data-tour="equipo"]',
    title: "Gestión de Equipo",
    content:
      "Administra a tu equipo, asigna roles y gestiona permisos de acceso.",
    position: "top" as const,
  },
  {
    target: '[data-tour="pagos"]',
    title: "Pagos",
    content:
      "Visualiza los pagos realizados por tus clientes y controla su estado.",
    position: "top" as const,
  },
  {
    target: '[data-tour="usuarios"]',
    title: "Usuarios",
    content:
      "Crea, edita o elimina usuarios, y gestiona el estado de sus pagos.",
    position: "top" as const,
  },
  {
    target: '[data-tour="settings"]',
    title: "Mis Datos",
    content: "Aquí puedes editar tus datos personales y configurar tu cuenta.",
    position: "top" as const,
  },
];

export function InteractiveTour() {
  const { isActive, currentStep, nextStep, prevStep, endTour } = useTour();
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isActive || currentStep >= tourSteps.length) return;

    const step = tourSteps[currentStep];
    const element = document.querySelector(step.target) as HTMLElement;

    if (element) {
      setTargetElement(element);

      // Scroll to element
      element.scrollIntoView({ behavior: "smooth", block: "center" });

      // Calculate tooltip position
      const rect = element.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      let top = rect.top + scrollTop;
      const left = rect.left + rect.width / 2;

      if (step.position === "bottom") {
        top += rect.height + 20;
      } else {
        top -= 20;
      }

      setTooltipPosition({ top, left });
    }
  }, [isActive, currentStep]);

  useEffect(() => {
    if (targetElement && isActive) {
      targetElement.style.zIndex = "1001";
      targetElement.style.boxShadow =
        "0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.5)";
      targetElement.style.borderRadius = "8px";
    }

    return () => {
      if (targetElement) {
        targetElement.style.zIndex = "";
        targetElement.style.boxShadow = "";
        targetElement.style.borderRadius = "";
      }
    };
  }, [targetElement, isActive]);

  console.log({ isActive, currentStep, steps: tourSteps.length });

  if (!isActive || currentStep >= tourSteps.length) return null;

  const step = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;

  // Evitar que el tooltip se salga de pantalla
  const maxLeft = window.innerWidth - 340;
  const safeLeft = Math.max(20, Math.min(tooltipPosition.left - 160, maxLeft));

  return (
    <>
      {/* Overlay */}
      {isActive && currentStep < tourSteps.length && (
        <div className="fixed inset-0 bg-black/50 z-[1000]" />
      )}

      {/* Tooltip */}
      <Card
        className="fixed z-[1002] w-80 shadow-lg"
        style={{
          top: tooltipPosition.top,
          left: safeLeft,
          transform:
            step.position === "top" ? "translateY(-100%)" : "translateY(0)",
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {currentStep + 1} de {tourSteps.length}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={endTour}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardTitle className="text-lg">{step.title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <CardDescription className="text-sm mb-4">
            {step.content}
          </CardDescription>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-1 bg-transparent"
            >
              <ArrowLeft className="h-3 w-3" />
              Anterior
            </Button>
            <Button
              size="sm"
              onClick={isLastStep ? endTour : nextStep}
              className="flex items-center gap-1"
            >
              {isLastStep ? "Finalizar" : "Siguiente"}
              {!isLastStep && <ArrowRight className="h-3 w-3" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
