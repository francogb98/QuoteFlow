-- CreateEnum
CREATE TYPE "public"."TipoNotificacion" AS ENUM ('PAGO_VENCIDO', 'PAGO_PROXIMO_VENCER', 'COMPROBANTE_SUBIDO', 'COMPROBANTE_APROBADO', 'COMPROBANTE_RECHAZADO', 'PAGO_CONFIRMADO', 'RECORDATORIO_PAGO', 'SISTEMA');

-- AlterTable
ALTER TABLE "public"."Administrador" ADD COLUMN     "emailNotificaciones" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "recibirNotificacionesComprobante" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "recibirNotificacionesPago" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "public"."Notificacion" (
    "id" TEXT NOT NULL,
    "tipo" "public"."TipoNotificacion" NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "administradorId" TEXT,
    "usuarioId" TEXT,
    "remitenteId" TEXT,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaLeida" TIMESTAMP(3),
    "entidadTipo" TEXT,
    "entidadId" TEXT,
    "enviadaPorEmail" BOOLEAN NOT NULL DEFAULT false,
    "fechaEnvioEmail" TIMESTAMP(3),

    CONSTRAINT "Notificacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notificacion_administradorId_idx" ON "public"."Notificacion"("administradorId");

-- CreateIndex
CREATE INDEX "Notificacion_usuarioId_idx" ON "public"."Notificacion"("usuarioId");

-- CreateIndex
CREATE INDEX "Notificacion_tipo_idx" ON "public"."Notificacion"("tipo");

-- CreateIndex
CREATE INDEX "Notificacion_leida_idx" ON "public"."Notificacion"("leida");

-- CreateIndex
CREATE INDEX "Notificacion_fechaCreacion_idx" ON "public"."Notificacion"("fechaCreacion");

-- AddForeignKey
ALTER TABLE "public"."Notificacion" ADD CONSTRAINT "Notificacion_administradorId_fkey" FOREIGN KEY ("administradorId") REFERENCES "public"."Administrador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notificacion" ADD CONSTRAINT "Notificacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notificacion" ADD CONSTRAINT "Notificacion_remitenteId_fkey" FOREIGN KEY ("remitenteId") REFERENCES "public"."Administrador"("id") ON DELETE SET NULL ON UPDATE CASCADE;
