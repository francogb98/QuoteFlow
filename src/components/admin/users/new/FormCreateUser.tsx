"use client";

import { toast } from "sonner";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  HelpCircle,
  Loader2,
  AlertCircle,
  CheckCircle,
  User,
} from "lucide-react";
import { addUserToAdmin } from "@/actions/admin/users";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserFormData {
  nombre: string;
  apellido: string;
  edad: number;
  documento: string;
  telefono: string;
  primerPagoMesSiguiente: boolean;
  fechaInicioMembresia?: string;
  usarFechaPersonalizada: boolean;
  correo?: string;
  rangoTarifaId?: string;
  dinamicaTarifaId?: string;
}

interface FormCreateProps {
  administradorId: string;
  configuracionTarifa?: any;
  onSuccess?: () => void;
  tarifasDisponibles: Array<any>;
  isDynamicTariff: boolean;
}

export const FormCreateUser = ({
  administradorId,
  configuracionTarifa,
  tarifasDisponibles,
  onSuccess,
  isDynamicTariff,
}: FormCreateProps) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<UserFormData>({
    defaultValues: {
      usarFechaPersonalizada: false,
      primerPagoMesSiguiente: false,
    },
  });

  const usarFechaPersonalizada = watch("usarFechaPersonalizada");

  const mutation = useMutation({
    mutationFn: addUserToAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      router.refresh();
      toast.success("Usuario agregado exitosamente!");
      setShowSuccess(true);
      reset();
      setTimeout(() => {
        setShowSuccess(false);
        onSuccess?.();
      }, 1500);
    },
    onError: (error) => {
      console.error("Error al agregar usuario:", error);
      toast.error(error.message || "Error al agregar el usuario");
    },
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      const submitData: any = { ...data, administradorId };

      if (isDynamicTariff && data.usarFechaPersonalizada && data.fechaInicioMembresia) {
        submitData.fechaInicioMembresia = new Date(data.fechaInicioMembresia);
      }

      await mutation.mutateAsync(submitData);
    } catch (error) {
      console.error("Error al agregar usuario:", error);
    }
  };

  const uniqueTarifas = [];
  const namesSeen = new Set();
  if (tarifasDisponibles) {
    for (const tarifa of tarifasDisponibles) {
      if (!isDynamicTariff) {
        if (!namesSeen.has(tarifa.nombre)) {
          namesSeen.add(tarifa.nombre);
          uniqueTarifas.push(tarifa);
        }
      } else {
        uniqueTarifas.push(tarifa);
      }
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-card rounded-xl shadow-lg border border-border p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
            <User className="w-6 h-6 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-card-foreground mb-2">
            Agregar Nuevo Usuario
          </h2>
          <p className="text-muted-foreground text-sm">
            Completa los datos del usuario para agregarlo al sistema
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Apellido */}
          <div>
            <Label htmlFor="apellido" className="mb-2 block">
              Apellido
            </Label>
            <Input
              {...register("apellido", {
                required: "El apellido es requerido",
                minLength: { value: 2, message: "El apellido debe tener al menos 2 caracteres" },
              })}
              id="apellido"
              type="text"
              placeholder="Ingrese el apellido"
              disabled={mutation.isPending}
            />
            {errors.apellido && (
              <p className="mt-2 text-sm text-destructive flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.apellido.message}
              </p>
            )}
          </div>

          {/* Nombre */}
          <div>
            <Label htmlFor="nombre" className="mb-2 block">
              Nombre
            </Label>
            <Input
              {...register("nombre", {
                required: "El nombre es requerido",
                minLength: { value: 3, message: "El nombre debe tener al menos 3 caracteres" },
              })}
              id="nombre"
              type="text"
              placeholder="Ingrese el nombre"
              disabled={mutation.isPending}
            />
            {errors.nombre && (
              <p className="mt-2 text-sm text-destructive flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.nombre.message}
              </p>
            )}
          </div>

          {/* Documento */}
          <div>
            <Label htmlFor="documento" className="mb-2 block">
              Documento
            </Label>
            <Input
              {...register("documento", {
                required: "El documento es requerido",
                pattern: { value: /^\d{8,12}$/, message: "El documento debe tener entre 8 y 12 dígitos" },
              })}
              id="documento"
              type="text"
              placeholder="Ej: 12345678"
              disabled={mutation.isPending}
              maxLength={12}
            />
            {errors.documento && (
              <p className="mt-2 text-sm text-destructive flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.documento.message}
              </p>
            )}
          </div>

          {/* Correo electrónico */}
          <div>
            <Label htmlFor="correo" className="mb-2 block">
              Correo Electrónico{" "}
              <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              {...register("correo", {
                pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: "Ingrese un correo electrónico válido" },
              })}
              id="correo"
              type="email"
              placeholder="Ej: usuario@correo.com"
              disabled={mutation.isPending}
            />
            {errors.correo && (
              <p className="mt-2 text-sm text-destructive flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.correo.message}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Agrega un correo para que el usuario reciba notificaciones de pago.
            </p>
          </div>

          {/* Edad */}
          <div>
            <Label htmlFor="edad" className="mb-2 block">
              Edad <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              {...register("edad", {
                min: { value: 1, message: "La edad debe ser mayor a 0" },
                max: { value: 120, message: "La edad debe ser menor a 120" },
              })}
              id="edad"
              type="number"
              placeholder="Ej: 25"
              disabled={mutation.isPending}
            />
            {errors.edad && (
              <p className="mt-2 text-sm text-destructive flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.edad.message}
              </p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <Label htmlFor="telefono" className="mb-2 block">
              Teléfono <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              {...register("telefono", {
                pattern: { value: /^[0-9+\-\s()]+$/, message: "Ingrese un número de teléfono válido" },
              })}
              id="telefono"
              type="tel"
              placeholder="Ej: 3855956688"
              disabled={mutation.isPending}
            />
            {errors.telefono && (
              <p className="mt-2 text-sm text-destructive flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.telefono.message}
              </p>
            )}
          </div>

          {/* Configuración de fecha de inicio (solo para sistema dinámico) */}
          {isDynamicTariff && (
            <div className="bg-secondary/50 p-4 rounded-lg border border-border">
              <Label htmlFor="fechaInicioMembresia" className="mb-2 block">
                Fecha de inicio de membresía
              </Label>
              <Input
                {...register("fechaInicioMembresia", {
                  required: usarFechaPersonalizada ? "La fecha de inicio es requerida" : false,
                })}
                id="fechaInicioMembresia"
                type="date"
                disabled={mutation.isPending}
                defaultValue={new Date().toISOString().split("T")[0]}
              />
            </div>
          )}

          {/* Checkbox primer pago mes siguiente */}
          <div className="bg-secondary/50 p-4 rounded-lg border border-border">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-card-foreground mb-2">
                Estado del pago del mes actual
                <div className="relative group ml-2 inline-block">
                  <HelpCircle className="w-4 h-4 text-primary cursor-help" />
                  <div className="absolute hidden group-hover:block z-10 w-64 p-3 text-xs text-card-foreground bg-popover border border-border rounded-lg shadow-lg -left-32 top-6">
                    <p className="font-medium mb-1">¿Qué significa esto?</p>
                    <p>
                      Aquí defines si el sistema debe crear el <b>pago</b> del
                      mes actual en estado{" "}
                      <span className="font-semibold">Pagado</span> o{" "}
                      <span className="font-semibold">Pendiente</span>.
                    </p>
                  </div>
                </div>
              </label>

              <div className="flex gap-6 mt-1">
                <label className="flex items-center text-sm text-card-foreground cursor-pointer">
                  <input
                    {...register("fechaInicioMembresia", { required: true })}
                    type="radio"
                    value="PAGADO"
                    className="w-4 h-4 text-primary border-primary focus:ring-ring"
                    disabled={mutation.isPending}
                  />
                  <span className="ml-2">Pagado</span>
                </label>

                <label className="flex items-center text-sm text-card-foreground cursor-pointer">
                  <input
                    {...register("fechaInicioMembresia", { required: true })}
                    type="radio"
                    value="PENDIENTE"
                    className="w-4 h-4 text-primary border-primary focus:ring-ring"
                    disabled={mutation.isPending}
                  />
                  <span className="ml-2">Pendiente</span>
                </label>
              </div>
            </div>
          </div>

          {/* Tarifa */}
          <div className="bg-secondary/50 p-4 rounded-lg border border-border">
            <Label htmlFor="tariffSelection" className="mb-2 block">
              Tarifa
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Select
              disabled={mutation.isPending}
              onValueChange={(value) => {
                const select = document.getElementById("tariffSelection") as HTMLSelectElement;
                if (select) {
                  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                    window.HTMLSelectElement.prototype,
                    "value"
                  )?.set;
                  if (nativeInputValueSetter) {
                    nativeInputValueSetter.call(select, value);
                    select.dispatchEvent(new Event("change", { bubbles: true }));
                  }
                }
              }}
            >
              <SelectTrigger id="tariffSelection" className="w-full">
                <SelectValue placeholder="Seleccione una opción" />
              </SelectTrigger>
              <SelectContent>
                {uniqueTarifas.map((tarifa: any) => (
                  <SelectItem key={tarifa.id} value={tarifa.id}>
                    {isDynamicTariff
                      ? `${tarifa.nombre} - $${tarifa.montoBase}`
                      : `${tarifa.nombre} - $${tarifa.monto}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(errors.rangoTarifaId || errors.dinamicaTarifaId) && (
              <p className="mt-2 text-sm text-destructive flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.rangoTarifaId?.message || errors.dinamicaTarifaId?.message}
              </p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              {isDynamicTariff
                ? "Selecciona la configuración dinámica que se aplicará a este usuario"
                : "Selecciona el rango de tarifa según el día del mes en que pagará"}
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={mutation.isPending || showSuccess}
              className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-bold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg text-base"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="animate-spin mr-2 w-5 h-5" />
                  Agregando Usuario...
                </>
              ) : showSuccess ? (
                <>
                  <CheckCircle className="mr-2 w-5 h-5" />
                  ¡Usuario Agregado!
                </>
              ) : (
                <>
                  <User className="mr-2 w-5 h-5" />
                  Agregar Usuario
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Error State */}
        {mutation.isError && (
          <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-start animate-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Error al agregar usuario</p>
              <p className="text-sm">
                {mutation.error?.message || "Ha ocurrido un error inesperado"}
              </p>
            </div>
          </div>
        )}

        {/* Success State */}
        {showSuccess && (
          <div className="mt-6 p-4 bg-accent/10 border border-accent/20 text-accent rounded-xl flex items-start animate-in slide-in-from-top-2 duration-300">
            <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">
                ¡Usuario agregado exitosamente!
              </p>
              <p className="text-sm">El modal se cerrará automáticamente...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
