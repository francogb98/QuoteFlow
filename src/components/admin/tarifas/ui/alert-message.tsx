import { AlertCircle, CheckCircle, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertMessageProps {
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
  className?: string;
}

export function AlertMessage({
  type,
  title,
  description,
  className,
}: AlertMessageProps) {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const styles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  const iconStyles = {
    success: "text-green-600",
    error: "text-red-600",
    warning: "text-yellow-600",
    info: "text-blue-600",
  };

  const Icon = icons[type];

  return (
    <div className={cn("border rounded-lg p-4", styles[type], className)}>
      <div className="flex items-start gap-3">
        <Icon
          className={cn("w-5 h-5 mt-0.5 flex-shrink-0", iconStyles[type])}
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm">{title}</h4>
          {description && (
            <p className="text-sm mt-1 opacity-90">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
