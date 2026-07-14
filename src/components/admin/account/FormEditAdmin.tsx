"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox"; // Importado el componente Checkbox
import { Label } from "@/components/ui/label"; // Importado el componente Label

import { editAdmin } from "@/actions/admin/account/editAdmin";
import { useNotifications } from "@/components/admin/tarifas/components/use-notifications";

// Roles disponibles (esto podría venir de una API en un entorno de producción)
const availableRoles = ["SUPER_ADMIN", "ADMIN", "EDITOR"];

interface FormValues {
  nombre: string;
  email: string;
  documento: string;
  telefono: string;
  password?: string;
  repeatPassword?: string;
  permitirModificarTarifa?: boolean;
  permitirModificarCobro?: boolean;
}

interface FormEditAdminProps {
  admin: FormValues & { id: string };
  setOpen: (open: boolean) => void;
}

export const FormEditAdmin = ({ admin, setOpen }: FormEditAdminProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      nombre: admin.nombre,
      email: admin.email,
      documento: admin.documento,
      telefono: admin.telefono,
      permitirModificarTarifa: admin.permitirModificarTarifa || false,
      permitirModificarCobro: admin.permitirModificarCobro || false,
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const password = watch("password");
  const repeatPassword = watch("repeatPassword");

  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotifications();

  const editar = useMutation({
    mutationFn: editAdmin,
    onError: (error: any) => {
      showError(
        "Error al editar admin",
        error?.message || "Ocurrió un error inesperado."
      );
      setError("root", { message: error?.message || "Error al editar admin" });
    },
    onSuccess: (data) => {
      if (data.ok) {
        queryClient.invalidateQueries({ queryKey: ["admins"] });
        setOpen(false);
        showSuccess(
          "¡Administrador actualizado!",
          "Los cambios se guardaron exitosamente."
        );
      } else {
        showError(
          "Error al editar admin",
          data.error || "Ocurrió un error inesperado."
        );
        setError("root", { message: data.error || "Error al editar admin" });
      }
    },
  });

  // Manejador para los cambios en los checkboxes

  const onSubmit = (data: FormValues) => {
    if (password && password !== repeatPassword) {
      setError("repeatPassword", { message: "Las contraseñas no coinciden" });
      return;
    }

    const dataToUpdate = {
      nombre: data.nombre,
      email: data.email,
      documento: data.documento,
      telefono: data.telefono,
      password: data.password || undefined,
      permitirModificarTarifa: data.permitirModificarTarifa || false,
      permitirModificarCobro: data.permitirModificarCobro || false,
    };

    editar.mutate({
      id: admin.id,
      ...dataToUpdate,
    });
  };

  return (
    <div className="p-4 border rounded bg-white">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
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

        <div className="flex items-center space-x-2 mt-4">
          <Checkbox
            id="modificar-tarifa"
            {...register("permitirModificarTarifa")}
          />
          <Label htmlFor="modificar-tarifa" className="cursor-pointer">
            El profesor puede modificar sus propias tarifas.
          </Label>
        </div>
        <div className="flex items-center space-x-2 mt-2">
          <Checkbox
            id="modificar-cobro"
            {...register("permitirModificarCobro")}
          />
          <Label htmlFor="modificar-cobro" className="cursor-pointer">
            El profesor puede modificar su modelo de cobro.
          </Label>
        </div>

        <Button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          variant="outline"
          className="mt-2"
        >
          {showPassword ? "Ocultar Contraseña" : "Cambiar Contraseña"}
        </Button>

        {showPassword && (
          <>
            <Input
              type="password"
              placeholder="Nueva Contraseña"
              {...register("password", {
                minLength: { value: 6, message: "Mínimo 6 caracteres" },
                maxLength: { value: 25, message: "Máximo 25 caracteres" },
              })}
              className={`focus-visible:ring-2 focus-visible:ring-purple-500 ${
                errors.password ? "border-red-500" : ""
              }`}
            />
            {errors.password && (
              <span className="text-xs text-red-500">
                {errors.password.message}
              </span>
            )}

            <Input
              type="password"
              placeholder="Repetir Nueva Contraseña"
              {...register("repeatPassword", {
                validate: (value) =>
                  !password ||
                  value === password ||
                  "Las contraseñas no coinciden",
              })}
              className={`focus-visible:ring-2 focus-visible:ring-purple-500 ${
                errors.repeatPassword ||
                (password && password !== repeatPassword)
                  ? "border-red-500"
                  : ""
              }`}
            />
            {(errors.repeatPassword ||
              (password && password !== repeatPassword)) && (
              <span className="text-xs text-red-500">
                {errors.repeatPassword?.message ||
                  "Las contraseñas no coinciden"}
              </span>
            )}
          </>
        )}

        {errors.root && (
          <span className="text-xs text-red-500">{errors.root.message}</span>
        )}

        <Button
          type="submit"
          className="bg-emerald-500 mt-2"
          disabled={editar.isPending}
        >
          {editar.isPending ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </form>
    </div>
  );
};
