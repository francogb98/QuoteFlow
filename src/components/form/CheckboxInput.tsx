"use client";

import React from "react";
import { FieldConfig } from "./Formulario";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface CheckboxInputProps {
  field: FieldConfig;
  register: any;
  errors: any;
}

export const CheckboxInput = ({
  field,
  register,
  errors,
}: CheckboxInputProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={field.name}
        onCheckedChange={(checked) => {
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            "checked"
          )?.set;
          const input = document.getElementById(field.name) as HTMLInputElement;
          if (input && nativeInputValueSetter) {
            nativeInputValueSetter.call(input, checked === true);
            input.dispatchEvent(new Event("change", { bubbles: true }));
          }
        }}
        {...register(field.name, { ...field.validation, valueAsBoolean: true })}
      />
      <Label htmlFor={field.name} className="cursor-pointer">
        {field.label}
      </Label>
      {errors[field.name] && (
        <p className="ml-2 text-sm text-destructive">
          {errors[field.name]?.message?.toString()}
        </p>
      )}
    </div>
  );
};
