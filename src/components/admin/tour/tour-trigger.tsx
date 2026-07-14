"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTour } from "./use-tour";
import { Play, RotateCcw } from "lucide-react";

export function TourTrigger() {
  const { hasCompletedTour, startTour, resetTour } = useTour();

  // Auto-start tour for new users
  useEffect(() => {
    if (!hasCompletedTour) {
      const timer = setTimeout(() => {
        startTour();
      }, 1000); // Wait 1 second after page load

      return () => clearTimeout(timer);
    }
  }, [hasCompletedTour, startTour]);

  if (!hasCompletedTour) return null;

  return (
    <Card className="mb-6 border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Play className="w-4 h-4" />
          Tour de la Aplicación
        </CardTitle>
        <CardDescription>
          ¿Quieres repasar las funcionalidades principales?
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-2">
          <Button onClick={startTour} variant="outline" size="sm">
            Repetir tour
          </Button>
          <Button onClick={resetTour} variant="ghost" size="sm">
            <RotateCcw className="w-3 h-3 mr-1" />
            Reiniciar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
