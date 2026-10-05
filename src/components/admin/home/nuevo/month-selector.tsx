"use client";

import { useTransition, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MESES = [
  { value: "enero", label: "Enero" },
  { value: "febrero", label: "Febrero" },
  { value: "marzo", label: "Marzo" },
  { value: "abril", label: "Abril" },
  { value: "mayo", label: "Mayo" },
  { value: "junio", label: "Junio" },
  { value: "julio", label: "Julio" },
  { value: "agosto", label: "Agosto" },
  { value: "septiembre", label: "Septiembre" },
  { value: "octubre", label: "Octubre" },
  { value: "noviembre", label: "Noviembre" },
  { value: "diciembre", label: "Diciembre" },
];

const MESES_MAP: Record<string, number> = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
  julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
};

const AÑO_ACTUAL = new Date().getFullYear();

function getCurrentMonthValue(): string {
  return MESES[new Date().getMonth()].value;
}

export function MonthSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const mesParam = searchParams.get("mes")?.toLowerCase();
  const currentMonth = getCurrentMonthValue();
  const urlMonth =
    mesParam && MESES_MAP[mesParam] ? mesParam : currentMonth;

  const handleChange = useCallback(
    (value: string) => {
      const url =
        value === currentMonth
          ? "/admin/home"
          : `/admin/home?mes=${value}`;

      startTransition(() => {
        router.push(url);
      });
    },
    [router, currentMonth],
  );

  return (
    <div className="flex items-center gap-2">
      {isPending && (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
      )}
      <Select value={urlMonth} onValueChange={handleChange}>
        <SelectTrigger
          size="sm"
          className={`gap-1.5 border-border bg-card text-xs font-medium shadow-sm transition-opacity ${
            isPending ? "opacity-70" : "opacity-100"
          }`}
        >
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end" className="min-w-[160px]">
          {MESES.map((m) => (
            <SelectItem key={m.value} value={m.value} className="text-xs">
              {m.label} {AÑO_ACTUAL}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}