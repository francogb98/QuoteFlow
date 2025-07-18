import type React from "react";
import { Crown, Gift, Zap } from "lucide-react";

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

// Define los planes
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
  // {
  //   id: "pro_mensual",
  //   name: "Plan Pro Mensual",
  //   price: "$15.000",
  //   period: "por mes",
  //   icon: <Zap className="w-6 h-6" />,
  //   features: [
  //     "Administradores ilimitados",
  //     "Usuarios ilimitados",
  //     "Soporte prioritario",
  //     "Reportes avanzados",
  //     "Integraciones",
  //   ],
  //   color: "from-purple-500 to-violet-600",
  // },
  // {
  //   id: "pro_anual",
  //   name: "Plan Pro Anual",
  //   price: "$150.000", // 15.000 * 12 = 180.000. Descuento de 2 meses: 150.000
  //   originalPrice: "$180.000",
  //   period: "por año",
  //   icon: <Crown className="w-6 h-6" />,
  //   popular: true,
  //   features: [
  //     "Administradores ilimitados",
  //     "Todo del plan mensual",
  //     "Ahorra $30.000 (2 meses)",
  //     "Soporte 24/7",
  //     "Funciones premium",
  //   ],
  //   badge: "Más popular",
  //   color: "from-emerald-500 to-green-600",
  // },
];
