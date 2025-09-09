/*
  Warnings:

  - You are about to drop the column `administradorId` on the `ConfiguracionTarifa` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."ConfiguracionTarifa_administradorId_idx";

-- DropIndex
DROP INDEX "public"."ConfiguracionTarifa_administradorId_key";

-- AlterTable
ALTER TABLE "public"."ConfiguracionTarifa" DROP COLUMN "administradorId";
