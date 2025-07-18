// components/CheckboxInput.tsx
"use client";

import React from "react";
import { FieldConfig } from "./Formulario";

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
  const checkboxClasses = `h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500`;

  return (
    <div className="flex items-center space-x-2">
      <input
        id={field.name}
        type="checkbox"
        className={checkboxClasses}
        // Para checkboxes, use register con valueAsBoolean
        {...register(field.name, { ...field.validation, valueAsBoolean: true })}
        readOnly={field.readOnly}
      />
      <label
        htmlFor={field.name}
        className="text-sm font-medium text-gray-700 cursor-pointer"
      >
        {field.label}
      </label>
      {errors[field.name] && (
        <p className="ml-2 text-sm text-red-600">
          {errors[field.name]?.message?.toString()}
        </p>
      )}
    </div>
  );
};
