/*
  Warnings:

  - A unique constraint covering the columns `[empresa]` on the table `Administrador` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Administrador_empresa_key" ON "Administrador"("empresa");
