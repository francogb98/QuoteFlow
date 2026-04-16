/*
  Warnings:

  - You are about to drop the column `whatsappHabilitado` on the `Empresa` table. All the data in the column will be lost.
  - You are about to drop the column `ultimaNotificacionWhatsApp` on the `Pago` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Empresa" DROP COLUMN "whatsappHabilitado";

-- AlterTable
ALTER TABLE "Pago" DROP COLUMN "ultimaNotificacionWhatsApp";

-- CreateIndex
CREATE INDEX "Administrador_empresaId_idx" ON "Administrador"("empresaId");

-- CreateIndex
CREATE INDEX "Administrador_configuracionTarifaId_idx" ON "Administrador"("configuracionTarifaId");

-- CreateIndex
CREATE INDEX "PasswordResetToken_adminId_idx" ON "PasswordResetToken"("adminId");

-- CreateIndex
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");

-- CreateIndex
CREATE INDEX "TempRegistration_expiresAt_idx" ON "TempRegistration"("expiresAt");
