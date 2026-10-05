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
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium ${
        isDeactivating
          ? "bg-red-50 text-red-700 border border-red-200"
          : "bg-green-50 text-green-700 border border-green-200"
      }`}
    >
      {isDeactivating ? (
        <XCircle className="w-3 h-3 flex-shrink-0" />
      ) : (
        <CheckCircle className="w-3 h-3 flex-shrink-0" />
      )}
      <span>
        {isDeactivating
          ? "El usuario será desactivado al guardar."
          : "El usuario será activado al guardar."}
      </span>
    </div>
  );
}