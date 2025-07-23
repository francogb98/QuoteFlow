import type {
  Usuario,
  Pago,
  ConfiguracionTarifa,
  RangoTarifa,
} from "@prisma/client";

// Tipo para el pago serializado (con monto y mora como number, fecha como string)
export type SerializedPago = Omit<Pago, "monto" | "fecha"> & {
  monto: number;
  fecha: string;
};

// Tipo para usuario con pagos serializados
export type UsuarioWithPagos = Usuario & {
  pagos: SerializedPago[];
};

// Tipo para los datos del administrador
export type AdminData = {
  usuarios: UsuarioWithPagos[];
  configuracionTarifa: (ConfiguracionTarifa & { rangos: RangoTarifa[] }) | null;
};
