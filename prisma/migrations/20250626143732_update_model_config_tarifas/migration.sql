/*
  Warnings:

  - You are about to drop the column `nombre` on the `ConfiguracionTarifa` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[configuracionTarifaId]` on the table `Administrador` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[administradorId]` on the table `ConfiguracionTarifa` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Administrador" ADD COLUMN     "configuracionTarifaId" TEXT;

-- AlterTable
ALTER TABLE "ConfiguracionTarifa" DROP COLUMN "nombre";

-- CreateIndex
CREATE UNIQUE INDEX "Administrador_configuracionTarifaId_key" ON "Administrador"("configuracionTarifaId");

-- CreateIndex
CREATE UNIQUE INDEX "ConfiguracionTarifa_administradorId_key" ON "ConfiguracionTarifa"("administradorId");

-- CreateIndex
CREATE INDEX "ConfiguracionTarifa_administradorId_idx" ON "ConfiguracionTarifa"("administradorId");

-- CreateIndex
CREATE INDEX "RangoTarifa_configuracionTarifaId_idx" ON "RangoTarifa"("configuracionTarifaId");
