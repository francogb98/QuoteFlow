/*
  Warnings:

  - You are about to drop the column `empresa` on the `Administrador` table. All the data in the column will be lost.
  - Added the required column `empresaId` to the `Administrador` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMINISTRADOR', 'PROFESOR');

-- CreateEnum
CREATE TYPE "TipoPlanEmpresa" AS ENUM ('BASICO', 'PRO');

-- CreateEnum
CREATE TYPE "EstadoEmpresa" AS ENUM ('ACTIVO', 'INACTIVO_POR_FALTA_DE_PAGO', 'SUSPENDIDO_MANUALMENTE');

-- CreateEnum
CREATE TYPE "FrecuenciaPago" AS ENUM ('MENSUAL', 'ANUAL');

-- DropIndex
DROP INDEX "Administrador_empresa_key";

-- AlterTable
ALTER TABLE "Administrador" DROP COLUMN "empresa",
ADD COLUMN     "empresaId" TEXT NOT NULL,
ADD COLUMN     "rol" "Rol" NOT NULL DEFAULT 'PROFESOR';

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,
    "planTipo" "TipoPlanEmpresa" NOT NULL DEFAULT 'BASICO',
    "estadoPago" "EstadoEmpresa" NOT NULL DEFAULT 'ACTIVO',
    "frecuenciaPago" "FrecuenciaPago" NOT NULL DEFAULT 'MENSUAL',
    "fechaUltimoPago" TIMESTAMP(3),
    "fechaProximoVencimiento" TIMESTAMP(3),
    "estaActiva" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_nombre_key" ON "Empresa"("nombre");

-- AddForeignKey
ALTER TABLE "Administrador" ADD CONSTRAINT "Administrador_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
