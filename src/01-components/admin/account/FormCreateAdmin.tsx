// FormCreateAdmin.tsx
"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox"; // Asume que tienes un componente Checkbox
import { Label } from "@/components/ui/label"; // Y un componente Label

import { createAdmin } from "@/01-actions/admin/account/createAdmin";
import { useNotifications } from "@/components/admin/tarifas/components/use-notifications";

interface FormValues {
  nombre: string;
  email: string;
  password: string;
  repeatPassword: string;
  documento: string;
  telefono: string;
  // ⭐️ Nuevos campos del formulario
  permitirModificarTarifa: boolean;
  permitirModificarCobro: boolean;
}

interface FormCreateAdminProps {
  setOpen: (open: boolean) => void;
}

export const FormCreateAdmin = ({ setOpen }: FormCreateAdminProps) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
    reset,
    control, // Add control here
  } = useForm<FormValues>({
    // ⭐️ Establece valores por defecto para los checkboxes
    defaultValues: {
      permitirModificarTarifa: false,
      permitirModificarCobro: false,
    },
  });

  const password = watch("password");
  const repeatPassword = watch("repeatPassword");

  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotifications();

  const crear = useMutation({
    mutationFn: createAdmin,
    onError: (error: any) => {
      showError(
        "Error al crear admin",
        error?.message || "Ocurrió un error inesperado."
      );
      setError("root", { message: error?.message || "Error al crear admin" });
    },
    onSuccess: (data) => {
      if (data.ok) {
        queryClient.invalidateQueries({ queryKey: ["admins"] });
        reset();
        setOpen(false);
        showSuccess(
          "¡Administrador creado!",
          "El nuevo administrador ha sido agregado exitosamente."
        );
      } else {
        showError(
          "Error al crear admin",
          data.error || "Error al crear el administrador."
        );
        setError("root", { message: data.error || "Error al crear admin" });
      }
    },
  });

  const onSubmit = (data: FormValues) => {
    if (data.password !== data.repeatPassword) {
      setError("repeatPassword", { message: "Las contraseñas no coinciden" });
      return;
    }

    // ⭐️ Envía los nuevos campos al backend
    crear.mutate({
      email: data.email,
      nombre: data.nombre,
      password: data.password,
      documento: data.documento,
      telefono: data.telefono,
      permitirModificarTarifa: data.permitirModificarTarifa,
      permitirModificarCobro: data.permitirModificarCobro,
    });
  };

  return (
    <div className="p-4 border rounded bg-white">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
        {/* ... (Tus campos de input existentes) ... */}
        <Input
          type="text"
          placeholder="Nombre"
          {...register("nombre", {
            required: "El nombre es obligatorio",
            maxLength: { value: 25, message: "Máximo 25 caracteres" },
          })}
          className={`focus-visible:ring-2 focus-visible:ring-purple-500 ${
            errors.nombre ? "border-red-500" : ""
          }`}
        />
        {errors.nombre && (
          <span className="text-xs text-red-500">{errors.nombre.message}</span>
        )}

        <Input
          type="text"
          placeholder="Documento"
          {...register("documento", {
            required: "El documento es obligatorio",
            maxLength: { value: 10, message: "Máximo 10 caracteres" },
          })}
          className={`focus-visible:ring-2 focus-visible:ring-purple-500 ${
            errors.documento ? "border-red-500" : ""
          }`}
        />
        {errors.documento && (
          <span className="text-xs text-red-500">
            {errors.documento.message}
          </span>
        )}

        <Input
          type="text"
          placeholder="Teléfono"
          {...register("telefono", {
            required: "El teléfono es obligatorio",
            maxLength: { value: 15, message: "Máximo 15 caracteres" },
          })}
          className={`focus-visible:ring-2 focus-visible:ring-purple-500 ${
            errors.telefono ? "border-red-500" : ""
          }`}
        />
        {errors.telefono && (
          <span className="text-xs text-red-500">
            {errors.telefono.message}
          </span>
        )}

        <Input
          type="email"
          placeholder="Correo electrónico"
          {...register("email", {
            required: "El correo es obligatorio",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Correo inválido",
            },
          })}
          className={`focus-visible:ring-2 focus-visible:ring-purple-500 ${
            errors.email ? "border-red-500" : ""
          }`}
        />
        {errors.email && (
          <span className="text-xs text-red-500">{errors.email.message}</span>
        )}

        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            {...register("password", {
              required: "La contraseña es obligatoria",
              minLength: { value: 6, message: "Mínimo 6 caracteres" },
              maxLength: { value: 25, message: "Máximo 25 caracteres" },
            })}
            className={`focus-visible:ring-2 focus-visible:ring-purple-500 pr-10 ${
              errors.password ? "border-red-500" : ""
            }`}
          />
          <Button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
            variant="ghost"
            size="sm"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </Button>
        </div>
        {errors.password && (
          <span className="text-xs text-red-500">
            {errors.password.message}
          </span>
        )}

        <div className="relative">
          <Input
            type={showRepeatPassword ? "text" : "password"}
            placeholder="Repetir Contraseña"
            {...register("repeatPassword", {
              required: "Repite la contraseña",
              validate: (value) =>
                value === password || "Las contraseñas no coinciden",
            })}
            className={`focus-visible:ring-2 focus-visible:ring-purple-500 pr-10 ${
              errors.repeatPassword ||
              (repeatPassword && repeatPassword !== password)
                ? "border-red-500"
                : ""
            }`}
          />
          <Button
            type="button"
            onClick={() => setShowRepeatPassword(!showRepeatPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
            variant="ghost"
            size="sm"
          >
            {showRepeatPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </Button>
        </div>
        {(errors.repeatPassword ||
          (repeatPassword && repeatPassword !== password)) && (
          <span className="text-xs text-red-500">
            {errors.repeatPassword?.message || "Las contraseñas no coinciden"}
          </span>
        )}

        {/* ⭐️ Aquí van los nuevos checkboxes */}
        <div className="flex items-center space-x-2 mt-4">
          <Controller
            name="permitirModificarTarifa"
            control={control}
            render={({ field }) => (
              <div className="flex items-center space-x-2 mt-4">
                <Checkbox
                  id="modificar-tarifa"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label htmlFor="modificar-tarifa" className="cursor-pointer">
                  El profesor puede modificar sus propias tarifas.
                </Label>
              </div>
            )}
          />
        </div>
        <div className="flex items-center space-x-2 mt-2">
          <Controller
            name="permitirModificarCobro"
            control={control}
            render={({ field }) => (
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  id="modificar-cobro"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label htmlFor="modificar-cobro" className="cursor-pointer">
                  El profesor puede modificar su modelo de cobro.
                </Label>
              </div>
            )}
          />
        </div>

        {errors.root && (
          <span className="text-xs text-red-500">{errors.root.message}</span>
        )}

        <Button
          type="submit"
          className="bg-emerald-500 mt-4"
          disabled={crear.isPending}
        >
          {crear.isPending ? "Creando..." : "Crear administrador"}
        </Button>
      </form>
    </div>
  );
};
