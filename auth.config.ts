import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import prisma from "@/lib/prisma";
import bcryptjs from "bcryptjs";
import { getAdmin } from "@/actions/users/admin/getAdmin"; // Asegúrate de que getAdmin maneje el retorno de null

export const { auth, handlers, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/new-account",
    signOut: "/auth/login",
  },
  events: {
    createUser: async ({ user }) => {},
    signIn: async ({ user }) => {},
    signOut: async ({}) => {},
  },
  callbacks: {
    async session({ session, token }) {
      // Asignamos los datos básicos del token primero
      if (token?.data) {
        session.user = {
          ...session.user,
          ...token.data,
        };
      }

      // Si tenemos ID de usuario, obtenemos los datos completos del admin
      if (session.user?.id) {
        const admin = await getAdmin(session.user.id);
        if (admin) {
          session.user = {
            ...session.user,
            ...admin,
            id: admin.id,
            name: admin.nombre,
            rol: admin.rol,
            email: admin.email, // NUEVO: Añadir email a la sesión
            claveMercadoPago: admin.claveMercadoPago || null,
            empresa: admin.empresa, // Ahora 'empresa' será el objeto completo
            // Ahora TypeScript sabe que configuracionTarifa puede ser null
            configuracionTarifa: admin.configuracionTarifa,
          };
        }
      }

      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.data = {
          id: user.id,
          name: (user as any).nombre, // Ajusta según tu modelo
          email: (user as any).email, // NUEVO: Ajusta para el campo email
          // Otras propiedades básicas que necesites
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

        // Buscar al administrador por documento
        const user = await prisma.administrador.findUnique({
          where: { documento: String(documento) },
          include: {
            empresa: true, // Incluir la relación de empresa
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
          user.password
        );

        if (!passwordMatch) {
          console.error("Contraseña incorrecta para el usuario:", documento);
          return null;
        }
        // Regresar el usuario sin la contraseña pero con las relaciones
        const { password: _, ...rest } = user;
        return rest;
      },
    }),
  ],
});
