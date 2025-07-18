import { PrismaClient } from "@prisma/client";

// Extiende el objeto global de Node.js para incluir 'prisma'
// Esto es necesario para que el cliente de Prisma sea singleton en desarrollo
declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

const prisma = globalThis.prismaGlobal || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

export default prisma;
