/*
  Warnings:

  - Added the required column `updatedAt` to the `LogNotificacionWhatsAppManual` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EstadoNotificacionWhatsAppManual" AS ENUM ('PENDING', 'OPENED', 'SENT');

-- AlterTable
ALTER TABLE "LogNotificacionWhatsAppManual" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "openedAt" TIMESTAMP(3),
ADD COLUMN     "status" "EstadoNotificacionWhatsAppManual" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "sentAt" DROP NOT NULL,
ALTER COLUMN "sentAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "LogNotificacionWhatsAppManual_status_idx" ON "LogNotificacionWhatsAppManual"("status");

-- CreateIndex
CREATE INDEX "LogNotificacionWhatsAppManual_openedAt_idx" ON "LogNotificacionWhatsAppManual"("openedAt");
