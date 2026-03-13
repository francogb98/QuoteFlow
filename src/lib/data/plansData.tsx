import { Sparkles } from "lucide-react";

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
  // {
  //   id: "pro_mensual",
  //   name: "Plan Pro",
  //   price: "$15.000",
  //   period: "por mes",
  //   icon: <Sparkles className="w-6 h-6" />,
  //   popular: true,
  //   features: [
  //     "Hasta 3 administradores",
  //     "Usuarios ilimitados",
  //     "Tarifas personalizadas",
  //     "Recordatorios por email",
  //     "Recordatorios automáticos por WhatsApp",
  //     "Prioridad en soporte",
  //   ],
  //   color: "from-green-500 to-emerald-600",
  //   base: "pro",
  //   frecuencia: "mensual",
  // },
  // {
  //   id: "pro_anual",
  //   name: "Plan Pro Anual",
  //   price: "$150.000",
  //   originalPrice: "$180.000",
  //   period: "por año",
  //   icon: <Sparkles className="w-6 h-6" />,
  //   popular: true,
  //   badge: "Ahorra 17%",
  //   features: [
  //     "Hasta 3 administradores",
  //     "Usuarios ilimitados",
  //     "Recordatorios automáticos por WhatsApp",
  //     "Recordatorios por email",
  //     "Prioridad en soporte",
  //     "Ahorra $30.000 (2 meses)",
  //   ],
  //   color: "from-green-500 to-emerald-600",
  //   base: "pro",
  //   frecuencia: "anual",
  // },
];
