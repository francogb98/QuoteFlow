// En types/find-user-result.ts
import type {
  Usuario,
  ConfiguracionTarifa,
  TipoPlanEmpresa,
  EstadoEmpresa,
  FrecuenciaPago,
} from "@prisma/client";

export interface FindUserResult {
  ok: boolean;
  message?: string;
  id?: string;
  administradorId?: string;
  usuario?: Usuario & {
    pagos: any[]; // o ajustá el tipo si definiste un modelo
  };
  configuracionTarifa?: ConfiguracionTarifa | null;
  empresa?: {
    id: string;
    nombre: string;
    planTipo: TipoPlanEmpresa;
    estadoPago: EstadoEmpresa;
    frecuenciaPago: FrecuenciaPago;
    fechaUltimoPago: Date | null;
    fechaProximoVencimiento: Date | null;
    estaActiva: boolean;
  };
}
