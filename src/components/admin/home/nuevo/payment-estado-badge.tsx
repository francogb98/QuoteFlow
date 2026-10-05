const MESES_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

interface PaymentEstadoBadgeProps {
  estado: string;
  mes?: number;
  año?: number;
  compact?: boolean;
}

const badgeStyles: Record<string, string> = {
  PAGADO:
    "bg-emerald-50 text-emerald-700 border border-emerald-200",
  PENDIENTE:
    "bg-amber-50 text-amber-700 border border-amber-200",
  VENCIDO:
    "bg-rose-50 text-rose-700 border border-rose-200",
  RECHAZADO:
    "bg-red-50 text-red-700 border border-red-200",
};

const badgeLabels: Record<string, string> = {
  PAGADO: "PAGADO",
  PENDIENTE: "PENDIENTE",
  VENCIDO: "VENCIDO",
  RECHAZADO: "RECHAZADO",
};

export function PaymentEstadoBadge({ estado, mes, año, compact = false }: PaymentEstadoBadgeProps) {
  const style = badgeStyles[estado] ?? "bg-muted text-muted-foreground border border-border";
  const label = badgeLabels[estado] ?? estado;
  const nombreMes = mes && mes >= 1 && mes <= 12 ? MESES_ES[mes - 1] : null;

  if (compact) {
    return (
      <span
        className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold leading-none ${style}`}
      >
        {label}
      </span>
    );
  }

  return (
    <div>
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${style}`}
      >
        {label}
      </span>

      {estado === "PENDIENTE" && nombreMes && (
        <span className="block text-[10px] text-gray-400">
          Mes: {nombreMes}
        </span>
      )}

      {estado === "VENCIDO" && nombreMes && año && (
        <span className="block text-[10px] font-medium text-rose-500">
          Debe: {nombreMes} {año}
        </span>
      )}
    </div>
  );
}