"use client";

import type React from "react";
import { Check } from "lucide-react";

// Define la interfaz para las opciones de plan (igual que antes)
interface PlanOption {
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
}

// Define la interfaz de props para este componente
interface PlanSelectionProps {
  plans: PlanOption[];
  selectedPlanId: PlanOption["id"];
  onSelectPlan: (planId: PlanOption["id"]) => void;
}

export const PlanSelection: React.FC<PlanSelectionProps> = ({
  plans,
  selectedPlanId,
  onSelectPlan,
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center mr-2">
          <span className="text-white text-sm font-bold">2</span>
        </div>
        Selecciona tu Plan
      </h2>
      <div className="text-center mb-6">
        <p className="text-sm text-gray-600">
          Elige el plan que mejor se adapte a tus necesidades
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`
              relative cursor-pointer rounded-2xl border-2 transition-all duration-300 hover:shadow-lg
              ${
                selectedPlanId === plan.id
                  ? "border-purple-500 shadow-lg transform scale-105"
                  : "border-purple-200 hover:border-purple-300"
              }
            `}
            onClick={() => onSelectPlan(plan.id)}
          >
            {/* Badge popular */}
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                <span
                  className={`bg-gradient-to-r ${plan.color} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg`}
                >
                  {plan.badge}
                </span>
              </div>
            )}
            <div className="p-6">
              {/* Header del plan */}
              <div className="text-center mb-6">
                <div
                  className={`w-14 h-14 bg-gradient-to-r ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg`}
                >
                  {plan.icon}
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h4>
                <div className="mb-2">
                  <div className="flex items-center justify-center gap-2">
                    {plan.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        {plan.originalPrice}
                      </span>
                    )}
                    <span className="text-3xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">{plan.period}</span>
                </div>
              </div>
              {/* Features */}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center text-sm text-gray-600"
                  >
                    <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              {/* Indicador de selección */}
              <div className="text-center">
                <div
                  className={`
                    w-8 h-8 rounded-full border-2 mx-auto transition-all duration-200 flex items-center justify-center
                    ${
                      selectedPlanId === plan.id
                        ? "border-purple-500 bg-purple-500"
                        : "border-gray-300"
                    }
                  `}
                >
                  {selectedPlanId === plan.id && (
                    <Check className="w-5 h-5 text-white" />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
