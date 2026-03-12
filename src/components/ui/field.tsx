import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface FieldProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
  children: React.ReactNode;
}

export function Field({
  className,
  orientation = "vertical",
  children,
}: FieldProps) {
  return (
    <div
      className={cn(
        "space-y-2",
        orientation === "horizontal" && "flex flex-row items-center gap-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function FieldLabel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Label className={cn("text-sm font-medium", className)}>{children}</Label>
  );
}

export function FieldDescription({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p className={cn("text-xs text-muted-foreground", className)}>{children}</p>
  );
}

export function FieldGroup({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}
