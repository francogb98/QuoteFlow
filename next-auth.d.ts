import type { DefaultSession, DefaultUser } from "next-auth";
import type {
  ConfiguracionTarifa,
  RangoTarifa,
  Empresa as PrismaEmpresa,
} from "@prisma/client"; // Importa Empresa de Prisma

// Extiende los tipos predeterminados de NextAuth
declare module "next-auth" {
  // Extiende la interfaz User para incluir las propiedades que obtienes de tu modelo Administrador
  interface User extends DefaultUser {
    id: string;
    nombre: string;
    documento: string;
    email: string; // NUEVO: Añadir email a la interfaz User
  }

  // Extiende la interfaz Session para incluir tus propiedades personalizadas en session.user
  interface Session extends DefaultSession {
    user: {
      id: string;
      name: string;
      documento: string;
      email: string; // NUEVO: Añadir email a la interfaz Session.user
      rol: string;
      claveMercadoPago: string | null;
      empresa: PrismaEmpresa; // Ahora 'empresa' es el objeto completo de PrismaEmpresa
      // Permite que configuracionTarifa sea el tipo de objeto o null
      configuracionTarifa:
        | (ConfiguracionTarifa & { rangos: RangoTarifa[] })
        | null;
      // Agrega cualquier otra propiedad que añadas a session.user
    } & DefaultSession["user"];
  }

  // Extiende la interfaz JWT para incluir los datos que almacenas en el token
  interface JWT {
    data?: {
      id: string;
      name: string;
      email: string; // NUEVO: Añadir email al token JWT
    };
  }
}
