-- AlterTable
ALTER TABLE "Pago" ADD COLUMN     "notificado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ultimaNotificacionWhatsApp" TIMESTAMP(3);
