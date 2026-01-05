"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MonthSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function MonthSelector({
  selectedDate,
  onDateChange,
}: MonthSelectorProps) {
  const handlePrevMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
  };

  return (
    <div className="flex items-center justify-center gap-4">
      <Button variant="outline" size="sm" onClick={handlePrevMonth}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="min-w-48 text-center text-lg font-semibold">
        {format(selectedDate, "MMMM 'de' yyyy", { locale: es })
          .charAt(0)
          .toUpperCase() +
          format(selectedDate, "MMMM 'de' yyyy", { locale: es }).slice(1)}
      </span>
      <Button variant="outline" size="sm" onClick={handleNextMonth}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
