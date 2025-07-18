/*
  Warnings:

  - You are about to drop the `Admin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FeeConfig` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TipoPlan" AS ENUM ('MES', 'ANUAL', 'PRUEBA');

-- CreateEnum
CREATE TYPE "Estado" AS ENUM ('PAGADO', 'PENDIENTE', 'MORA', 'EXTRA_MORA', 'INACTIVO');

-- DropForeignKey
ALTER TABLE "FeeConfig" DROP CONSTRAINT "FeeConfig_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_userId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_adminId_fkey";

-- DropTable
DROP TABLE "Admin";

-- DropTable
DROP TABLE "FeeConfig";

-- DropTable
DROP TABLE "Payment";

-- DropTable
DROP TABLE "User";

-- DropEnum
DROP TYPE "PlanType";

-- DropEnum
DROP TYPE "Status";

-- CreateTable
CREATE TABLE "Administrador" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "claveMercadoPago" TEXT,
    "plan" "TipoPlan" NOT NULL DEFAULT 'PRUEBA',
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Administrador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "telefono" TEXT,
    "estado" "Estado" NOT NULL DEFAULT 'PENDIENTE',
    "administradorId" TEXT NOT NULL,
    "estaActivo" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comprobante" TEXT,
    "usuarioId" TEXT NOT NULL,
    "estaVencido" BOOLEAN NOT NULL DEFAULT false,
    "mora" DOUBLE PRECISION DEFAULT 0,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfiguracionTarifa" (
    "id" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaFin" TIMESTAMP(3),
    "administradorId" TEXT NOT NULL,

    CONSTRAINT "ConfiguracionTarifa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Administrador_documento_key" ON "Administrador"("documento");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_administradorId_fkey" FOREIGN KEY ("administradorId") REFERENCES "Administrador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfiguracionTarifa" ADD CONSTRAINT "ConfiguracionTarifa_administradorId_fkey" FOREIGN KEY ("administradorId") REFERENCES "Administrador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
