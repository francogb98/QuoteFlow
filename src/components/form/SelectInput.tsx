"use client";

import React from "react";
import { FieldConfig } from "./Formulario";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectInputProps {
  field: FieldConfig;
  register: any;
  errors: any;
  options: { value: string; label: string }[];
}

export const SelectInput = ({
  field,
  register,
  errors,
  options,
}: SelectInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.name}>{field.label}</Label>
      <Select
        defaultValue=""
        onValueChange={(value) => {
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLSelectElement.prototype,
            "value"
          )?.set;
          const select = document.getElementById(field.name) as HTMLSelectElement;
          if (select && nativeInputValueSetter) {
            nativeInputValueSetter.call(select, value);
            select.dispatchEvent(new Event("change", { bubbles: true }));
          }
        }}
      >
        <SelectTrigger
          id={field.name}
          className="w-full"
          aria-invalid={!!errors[field.name]}
        >
          <SelectValue placeholder={field.placeholder || "Seleccionar..."} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors[field.name] && (
        <p className="text-sm text-destructive">
          {errors[field.name]?.message?.toString()}
        </p>
      )}
    </div>
  );
};
