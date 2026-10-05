"use client";

export type PaymentFilter = "todos" | "al-dia" | "pendientes" | "vencidos";

interface FilterTabsProps {
  active: PaymentFilter;
  onChange: (filter: PaymentFilter) => void;
}

const filters: { key: PaymentFilter; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "al-dia", label: "Al día" },
  { key: "pendientes", label: "Pendientes" },
  { key: "vencidos", label: "Vencidos" },
];

export function FilterTabs({ active, onChange }: FilterTabsProps) {
  return (
    <div className="flex items-center gap-1.5 border-b border-border pb-1.5">
      {filters.map((f) => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            active === f.key
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}