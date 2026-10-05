import { Loader2 } from "lucide-react";

export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center">
        <Loader2 className="w-6 h-6 text-purple-500 animate-spin mx-auto mb-2" />
        <p className="text-xs text-gray-500">Cargando...</p>
      </div>
    </div>
  );
}