// components/Input.tsx
"use client";

import React from "react";
import { FieldConfig } from "./Formulario";

interface InputProps {
  field: FieldConfig;
  register: any;
  errors: any;
}

export const Input = ({ field, register, errors }: InputProps) => {
  const inputClasses = `mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all duration-200
    ${errors[field.name] ? "border-red-400" : "border-gray-300"}`;

  return (
    <div className="space-y-1">
      <label
        htmlFor={field.name}
        className="block text-sm font-medium text-gray-700"
      >
        {field.label}
      </label>
      <input
        id={field.name}
        type={field.type}
        placeholder={field.placeholder || field.label}
        className={inputClasses}
        {...register(field.name, field.validation)}
        readOnly={field.readOnly}
      />
      {errors[field.name] && (
        <p className="mt-1 text-sm text-red-600">
          {errors[field.name]?.message?.toString()}
        </p>
      )}
    </div>
  );
};
