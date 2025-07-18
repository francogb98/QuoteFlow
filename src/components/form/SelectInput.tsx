// components/SelectInput.tsx
"use client";

import React from "react";
import { FieldConfig } from "./Formulario";

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
  const selectClasses = `mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all duration-200
    ${errors[field.name] ? "border-red-400" : "border-gray-300"}`;

  return (
    <div className="space-y-1">
      <label
        htmlFor={field.name}
        className="block text-sm font-medium text-gray-700"
      >
        {field.label}
      </label>
      <select
        id={field.name}
        className={selectClasses}
        {...register(field.name, field.validation)}
        readOnly={field.readOnly}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {errors[field.name] && (
        <p className="mt-1 text-sm text-red-600">
          {errors[field.name]?.message?.toString()}
        </p>
      )}
    </div>
  );
};
