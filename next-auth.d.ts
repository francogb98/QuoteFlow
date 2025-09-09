import type { DefaultSession, DefaultUser } from "next-auth";
import type {
  ConfiguracionTarifa,
  RangoTarifa,
  Empresa as PrismaEmpresa,
  ConfiguracionComprobantes,
  ModeloCobro,
  Rol,
} from "@prisma/client";

// Extiende los tipos predeterminados de NextAuth
declare module "next-auth" {
  // Extiende la interfaz User para incluir las propiedades que obtienes de tu modelo Administrador
  interface User extends DefaultUser {
    id: string;
    nombre: string;
    documento: string;
    email: string;
    rol: Rol;
    telefono: string;
    estaActivo: boolean;
    empresaId: string;
    modeloDeCobro: ModeloCobro | null;
    mercadoPagoActivo: boolean;
    // Relaciones
    empresa?: PrismaEmpresa;
    configuracionTarifa?:
      | (ConfiguracionTarifa & { rangos: RangoTarifa[] })
      | null;
    configuracionComprobantes?: ConfiguracionComprobantes | null;
  }

  // Extiende la interfaz Session para incluir tus propiedades personalizadas en session.user
  interface Session extends DefaultSession {
    user: {
      id: string;
      name: string;
      documento: string;
      email: string;
      rol: Rol;
      telefono: string;
      estaActivo: boolean;
      claveMercadoPago: string | null;
      mercadoPagoActivo: boolean;

      // Información de la empresa
      empresa: PrismaEmpresa;
      empresaId: string | null;
      modeloCobro: ModeloCobro | null;

      // Configuraciones
      configuracionTarifa:
        | (ConfiguracionTarifa & { rangos: RangoTarifa[] })
        | null;
      configuracionComprobantes: ConfiguracionComprobantes | null;

      // NUEVO: Estado de configuración
      configuracionCompleta: boolean;
    } & DefaultSession["user"];
  }

  // Extiende la interfaz JWT para incluir los datos que almacenas en el token
  interface JWT {
    data?: {
      id: string;
      name: string;
      email: string;
      documento: string;
    };
  }
}
