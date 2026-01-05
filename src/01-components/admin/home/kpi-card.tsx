interface KPICardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  variant?: "default" | "success" | "warning" | "danger";
}

export function KPICard({
  label,
  value,
  subtitle,
  variant = "default",
}: KPICardProps) {
  const variantStyles = {
    default: "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300",
    success: "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-300",
    warning:
      "bg-yellow-50 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-300",
    danger: "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-300",
  };

  return (
    <div className={`rounded-lg border p-6 ${variantStyles[variant]}`}>
      <p className="text-sm font-medium opacity-75">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      {subtitle && <p className="mt-1 text-xs opacity-60">{subtitle}</p>}
    </div>
  );
}
