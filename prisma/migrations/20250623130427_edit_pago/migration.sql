/*
  Warnings:

  - Added the required column `estado` to the `Pago` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pago" ADD COLUMN     "estado" TEXT NOT NULL,
ADD COLUMN     "metodo" TEXT NOT NULL DEFAULT 'efectivo';
