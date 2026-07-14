"use client";

import React from "react";
import { FieldConfig } from "./Formulario";
import { Label } from "@/components/ui/label";
import { Input as ShadcnInput } from "@/components/ui/input";

interface InputProps {
  field: FieldConfig;
  register: any;
  errors: any;
}

export const Input = ({ field, register, errors }: InputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.name}>{field.label}</Label>
      <ShadcnInput
        id={field.name}
        type={field.type}
        placeholder={field.placeholder || field.label}
        aria-invalid={!!errors[field.name]}
        {...register(field.name, field.validation)}
        readOnly={field.readOnly}
      />
      {errors[field.name] && (
        <p className="text-sm text-destructive">
          {errors[field.name]?.message?.toString()}
        </p>
      )}
    </div>
  );
};
