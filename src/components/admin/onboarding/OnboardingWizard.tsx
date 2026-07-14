"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle,
  UserPlus,
  Settings,
  Share2,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  X,
  PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  buttonText: string;
}

const steps: OnboardingStep[] = [
  {
    id: "tarifa",
    title: "Configura tu tarifa",
    description:
      "Define el monto que cobrarás a tus alumnos por mes.",
    icon: <CreditCard className="w-5 h-5" />,
    href: "/admin/settings",
    buttonText: "Configurar tarifa",
  },
  {
    id: "usuario",
    title: "Agrega tu primer usuario",
    description:
      "Registra un alumno para comenzar a gestionar pagos.",
    icon: <UserPlus className="w-5 h-5" />,
    href: "/admin/users",
    buttonText: "Agregar usuario",
  },
  {
    id: "compartir",
    title: "Comparte tu link",
    description:
      "Envía el link a tus alumnos para que puedan ver y pagar sus cuotas.",
    icon: <Share2 className="w-5 h-5" />,
    href: "/admin/home",
    buttonText: "Ver mi link",
  },
];

const STORAGE_KEY = "onboarding_completed";

export function OnboardingWizard() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const markCompleted = (stepId: string) => {
    setCompletedSteps((prev) => new Set([...prev, stepId]));
  };

  if (!isOpen) return null;

  const allCompleted = completedSteps.size === steps.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-purple-600 to-emerald-600 p-6 text-white">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold">Bienvenido a CuotaFacil</h2>
          <p className="text-sm text-white/80 mt-1">
            Completa estos pasos para empezar a usar la plataforma
          </p>
          {/* Progress */}
          <div className="flex gap-1.5 mt-4">
            {steps.map((step, i) => (
              <div
                key={step.id}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                  completedSteps.has(step.id)
                    ? "bg-white"
                    : i === currentStep
                      ? "bg-white/60"
                      : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {allCompleted ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PartyPopper className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                ¡Todo listo!
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Ya puedes empezar a gestionar tus alumnos y cobros desde el
                dashboard.
              </p>
              <Button
                onClick={handleClose}
                className="bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-700 hover:to-emerald-700 text-white"
              >
                Ir al Dashboard
              </Button>
            </div>
          ) : (
            <>
              {/* Step indicator */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-gray-500">
                  Paso {currentStep + 1} de {steps.length}
                </span>
                <span className="text-xs font-medium text-purple-600">
                  {completedSteps.size}/{steps.length} completados
                </span>
              </div>

              {/* Step card */}
              {(() => {
                const step = steps[currentStep];
                const isCompleted = completedSteps.has(step.id);
                return (
                  <div
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      isCompleted
                        ? "border-green-200 bg-green-50"
                        : "border-purple-200 bg-purple-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          isCompleted
                            ? "bg-green-100 text-green-600"
                            : "bg-purple-100 text-purple-600"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          step.icon
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {step.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </div>

        {/* Footer */}
        {!allCompleted && (
          <div className="px-6 pb-6 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => markCompleted(steps[currentStep].id)}
                className={
                  completedSteps.has(steps[currentStep].id)
                    ? "bg-green-50 border-green-200 text-green-700"
                    : ""
                }
              >
                {completedSteps.has(steps[currentStep].id)
                  ? "Completado"
                  : "Marcar listo"}
              </Button>
              <Button
                onClick={() => {
                  markCompleted(steps[currentStep].id);
                  handleNext();
                }}
                className="bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-700 hover:to-emerald-700 text-white gap-1"
              >
                {currentStep === steps.length - 1 ? (
                  "Finalizar"
                ) : (
                  <>
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
