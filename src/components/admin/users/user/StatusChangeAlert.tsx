import { CheckCircle, XCircle } from "lucide-react";

interface StatusChangeAlertProps {
  currentStatus: string;
  newStatus: string;
}

export function StatusChangeAlert({
  currentStatus,
  newStatus,
}: StatusChangeAlertProps) {
  if (currentStatus === newStatus) return null;

  const isDeactivating = newStatus === "INACTIVO";

  return (
    <div
      className={`mb-6 p-4 rounded-lg border ${
        isDeactivating
          ? "bg-red-50 border-red-200"
          : "bg-green-50 border-green-200"
      }`}
    >
      <div className="flex items-start gap-3">
        {isDeactivating ? (
          <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        ) : (
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
        )}
        <div className="flex-1">
          <h4
            className={`font-medium mb-1 ${
              isDeactivating ? "text-red-900" : "text-green-900"
            }`}
          >
            {isDeactivating ? "Desactivando Usuario" : "Activando Usuario"}
          </h4>
          <p
            className={`text-sm ${
              isDeactivating ? "text-red-800" : "text-green-800"
            }`}
          >
            {isDeactivating
              ? "El usuario no podrá acceder al sistema una vez guardados los cambios."
              : "El usuario podrá acceder al sistema una vez guardados los cambios."}
          </p>
        </div>
      </div>
    </div>
  );
}
