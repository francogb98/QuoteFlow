"use client";

import { useForm } from "react-hook-form";
import React from "react";
import { Input } from "./Input";
import { SelectInput } from "./SelectInput";
import { CheckboxInput } from "./CheckboxInput";
import { Button } from "@/components/ui/button";

export interface FieldConfig {
  name: string;
  label: string;
  type?: string;
  validation?: Record<string, any>;
  hidden?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  component?: "input" | "select" | "checkbox";
  options?: { value: string; label: string }[];
}

interface FormularioProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  fieldsConfig: FieldConfig[];
}

export function Formulario({
  initialData = {},
  onSubmit,
  fieldsConfig,
}: FormularioProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: initialData });

  const handleFormSubmit = async (data: any) => {
    await onSubmit(data);
  };

  const isEditing = !!initialData.id;
  const buttonText = isEditing ? "Guardar Cambios" : "Crear Usuario";
  const formTitle = isEditing ? "Editar Usuario" : "Crear Nuevo Usuario";

  return (
    <div className="max-w-md mx-auto p-6 bg-card rounded-lg shadow-md mt-10 border border-border">
      <h2 className="text-2xl font-bold mb-6 text-center text-card-foreground">{formTitle}</h2>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {fieldsConfig.map((field) => {
          if (field.hidden && isEditing) {
            return null;
          }

          switch (field.component) {
            case "select":
              return (
                <SelectInput
                  key={field.name}
                  field={field}
                  register={register}
                  errors={errors}
                  options={field.options || []}
                />
              );
            case "checkbox":
              return (
                <CheckboxInput
                  key={field.name}
                  field={field}
                  register={register}
                  errors={errors}
                />
              );
            case "input":
            default:
              return (
                <Input
                  key={field.name}
                  field={field}
                  register={register}
                  errors={errors}
                />
              );
          }
        })}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg"
        >
          {isSubmitting ? "Cargando..." : buttonText}
        </Button>
      </form>
    </div>
  );
}
