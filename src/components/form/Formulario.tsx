// components/Formulario.tsx
"use client";

import { useForm } from "react-hook-form";
import React from "react";
import { Input } from "./Input"; // Tu Input para campos de texto/password/email
import { SelectInput } from "./SelectInput"; // Nuevo componente para select
import { CheckboxInput } from "./CheckboxInput"; // Nuevo componente para checkbox

export interface FieldConfig {
  name: string;
  label: string;
  type?: string; // Hacemos 'type' opcional ya que 'component' lo definirá a veces
  validation?: Record<string, any>; // Para reglas de react-hook-form
  hidden?: boolean; // Para ocultar un campo en ciertos modos (ej. contraseña en edición)
  readOnly?: boolean; // Para hacer un campo de solo lectura
  placeholder?: string; // Añadir placeholder para mayor flexibilidad
  component?: "input" | "select" | "checkbox"; // Nuevo: Tipo de componente a renderizar
  options?: { value: string; label: string }[]; // Nuevo: Opciones para select
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
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center">{formTitle}</h2>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {fieldsConfig.map((field) => {
          if (field.hidden && isEditing) {
            return null;
          }

          // Renderiza el componente de entrada basado en la propiedad 'component'
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
            default: // Por defecto, si no se especifica 'component', asumimos 'input'
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
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg"
        >
          {isSubmitting ? "Cargando..." : buttonText}
        </button>
      </form>
    </div>
  );
}
