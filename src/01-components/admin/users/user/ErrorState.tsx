import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  error: any;
}

export function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-red-200 max-w-md mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error al cargar usuario
          </h3>
          <p className="text-gray-600 text-sm">
            {error?.message || "Ha ocurrido un error inesperado"}
          </p>
        </div>
      </div>
    </div>
  );
}
