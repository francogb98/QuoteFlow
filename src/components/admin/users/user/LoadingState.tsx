import { Loader2 } from "lucide-react";

export function LoadingState() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Cargando información del usuario...
          </h3>
          <p className="text-gray-600 text-sm">Esto solo tomará un momento</p>
        </div>
      </div>
    </div>
  );
}
