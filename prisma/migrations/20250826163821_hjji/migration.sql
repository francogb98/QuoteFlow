/*
  Warnings:

  - You are about to drop the column `motivo` on the `Usuario` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Pago" ADD COLUMN     "motivo" TEXT;

-- AlterTable
ALTER TABLE "public"."Usuario" DROP COLUMN "motivo";
