// types/usuario.ts
import { Usuario, Pago } from "@prisma/client";

export type UsuarioWithPagos = Usuario & {
  pagos: Pago[];
};

// O si necesitas más personalización:
export type CustomUsuarioResponse = {
  ok: boolean;
  message?: string;
  data?: UsuarioWithPagos;
  error?: string;
};
