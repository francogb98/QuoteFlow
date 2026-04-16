import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import prisma from "@/lib/prisma";
import bcryptjs from "bcryptjs";
import { getAdminForAuth } from "@/lib/auth/get-admin";

export const { auth, handlers, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/new-account",
    signOut: "https://cuotafacil.com.ar",
  },
  events: {
    createUser: async ({ user }) => {},
    signIn: async ({ user }) => {
      // Verificar si necesita configuración inicial
      if (user?.id) {
        const admin = await getAdminForAuth(user.id);
        if (admin) {
          // Podrías agregar lógica adicional aquí si es necesario
          console.log("Usuario necesita completar configuración inicial");
        }
      }
    },
    signOut: async ({}) => {},
  },
  callbacks: {
    async session({ session, token }) {
      // Casteamos token.data para evitar errores de TypeScript
      const tokenData = token.data as any;

      // Asignamos los datos básicos del token primero
      if (tokenData) {
        session.user = {
          ...session.user,
          ...tokenData,
        };
      }

      // Si tenemos ID de usuario, obtenemos los datos completos del admin
      if (session.user?.id) {
        const admin = (await getAdminForAuth(session.user.id)) as any;
        if (admin) {
          // Verificar si la configuración está completa
          //@ts-ignore
          const configuracionCompleta = !!admin.configuracionTarifa;

          session.user = {
            ...session.user,
            ...admin,
            id: admin.id,
            name: admin.nombre,
            rol: admin.rol,
            email: admin.email,
            claveMercadoPago: admin.claveMercadoPago || null,
            empresa: admin.empresa,
            empresaId: admin.empresaId || tokenData?.empresaId, // Usar empresaId del token como fallback
            configuracionTarifa: admin.configuracionTarifa,
            // NUEVO: Campos para configuración inicial
            configuracionCompleta,
            // NUEVO: Configuración de comprobantes si existe
            modeloDeCobro: admin.modeloDeCobro || null,
          };
        } else if (tokenData?.empresaId) {
          // Si no podemos obtener el admin pero tenemos empresaId en el token, usarlo
          session.user.empresaId = tokenData.empresaId;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.data = {
          id: user.id,
          name: (user as any).nombre,
          email: (user as any).email,
          documento: (user as any).documento,
          empresaId: (user as any).empresaId,
        };
      }
      return token;
    },
  },
  providers: [
    Credentials({
      credentials: {
        documento: { label: "documento", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            documento: z
              .string()
              .min(8, "El documento debe tener al menos 8 caracteres"),
            password: z
              .string()
              .min(6, "La contraseña debe tener al menos 6 caracteres"),
          })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          console.error("Error de validación:", parsedCredentials.error);
          return null;
        }

        const { documento, password } = parsedCredentials.data;

        // Buscar al administrador por documento con todas las relaciones necesarias

        const user = await prisma.administrador.findUnique({
          where: { documento: String(documento) },
          include: {
            empresa: true,
            usuarios: true,
            configuracionTarifa: {
              include: {
                rangos: true,
              },
            },
          },
        });

        if (!user) {
          console.error("Usuario no encontrado para el documento:", documento);
          return null;
        }

        const passwordMatch = bcryptjs.compareSync(
          String(password),
          user.password,
        );

        if (!passwordMatch) {
          console.error("Contraseña incorrecta para el usuario:", documento);
          return null;
        }

        // Regresar el usuario sin la contraseña pero con las relaciones
        const { password: _, ...rest } = user;
        return {
          ...rest,
          mercadoPagoActivo: false, // Default value since mercadoPagoActivo is not in the user object
        };
      },
    }),
  ],
});

// NUEVO: Función helper para obtener el usuario actual
export async function getCurrentUser() {
  const session = await auth();
  return session?.user || null;
}

// NUEVO: Función helper para verificar si el usuario está autenticado
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Usuario no autenticado");
  }
  return session.user;
}
