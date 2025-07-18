/*
  Warnings:

  - The `estado` column on the `Pago` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `metodo` column on the `Pago` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `año` to the `Pago` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mes` to the `Pago` table without a default value. This is not possible if the table is not empty.
  - Added the required column `periodo` to the `Pago` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PAGADO', 'PENDIENTE', 'VENCIDO');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'MERCADOPAGO', 'TRANSFERENCIA', 'TARJETA');

-- AlterTable
ALTER TABLE "Pago" ADD COLUMN     "año" INTEGER NOT NULL,
ADD COLUMN     "mes" INTEGER NOT NULL,
ADD COLUMN     "periodo" TEXT NOT NULL,
DROP COLUMN "estado",
ADD COLUMN     "estado" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
DROP COLUMN "metodo",
ADD COLUMN     "metodo" "MetodoPago" NOT NULL DEFAULT 'EFECTIVO';
