"use client";

import type React from "react";
import { Star, Crown, Package, Gift } from "lucide-react";

// Define la interfaz para las opciones de plan
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
}

// Define los planes disponibles
export const plans: PlanOption[] = [
  {
    id: "basico_mensual",
    name: "Plan Básico Mensual",
    price: "$10.000",
    period: "por mes",
    icon: <Gift className="w-6 h-6" />,
    features: [
      "Solo 1 administrador",
      "Usuarios ilimitados",
      "Tarifas Personalizadas",
      "Reportes básicos",
    ],
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: "basico_anual",
    name: "Plan Básico Anual",
    price: "$100.000", // 10.000 * 12 = 120.000. Descuento de 2 meses: 100.000
    originalPrice: "$120.000",
    period: "por año",
    icon: <Gift className="w-6 h-6" />,
    features: [
      "Solo 1 administrador",
      "Todo del plan mensual",
      "Ahorra $20.000 (2 meses)",
      "Soporte básico",
      "Reportes básicos",
    ],
    badge: "Ahorra 17%",
    color: "from-purple-500 to-violet-600",
  },
];
