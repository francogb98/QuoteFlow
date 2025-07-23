import { z } from "zod";
import { TipoPlanEmpresa, FrecuenciaPago } from "@prisma/client";

export const PrepareRegistrationSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  documento: z.string().min(1, "El documento es requerido"),
  email: z.email("Debe ser un email válido"),
  nombreEmpresa: z.string().min(1, "El nombre de la empresa es requerido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  telefono: z.string().min(1, "El teléfono es requerido"),
  planTipo: z.enum(TipoPlanEmpresa, {
    error: () => ({ message: "Selecciona un tipo de plan válido" }),
  }),
  frecuenciaPago: z.enum(FrecuenciaPago, {
    error: () => ({ message: "Selecciona una frecuencia de pago válida" }),
  }),
});

// Tipo TypeScript derivado del esquema Zod
export type PrepareRegistrationData = z.infer<typeof PrepareRegistrationSchema>;
