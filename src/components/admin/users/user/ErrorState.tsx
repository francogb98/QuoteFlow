import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  error: any;
}

export function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center">
        <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
        <p className="text-xs font-medium text-gray-700">Error al cargar</p>
        <p className="text-[10px] text-gray-500 mt-0.5">
          {error?.message || "Error inesperado"}
        </p>
      </div>
    </div>
  );
}