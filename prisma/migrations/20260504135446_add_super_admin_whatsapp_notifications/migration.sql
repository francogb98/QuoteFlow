-- CreateTable
CREATE TABLE "ConfiguracionWhatsApp" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "mensajeTemplate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "ConfiguracionWhatsApp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogNotificacionWhatsAppManual" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "pagoId" TEXT NOT NULL,
    "administradorId" TEXT NOT NULL,
    "telefonoNormalizado" TEXT NOT NULL,
    "mensajeRenderizado" TEXT NOT NULL,
    "waUrl" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogNotificacionWhatsAppManual_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LogNotificacionWhatsAppManual_usuarioId_idx" ON "LogNotificacionWhatsAppManual"("usuarioId");

-- CreateIndex
CREATE INDEX "LogNotificacionWhatsAppManual_pagoId_idx" ON "LogNotificacionWhatsAppManual"("pagoId");

-- CreateIndex
CREATE INDEX "LogNotificacionWhatsAppManual_administradorId_idx" ON "LogNotificacionWhatsAppManual"("administradorId");

-- CreateIndex
CREATE INDEX "LogNotificacionWhatsAppManual_sentAt_idx" ON "LogNotificacionWhatsAppManual"("sentAt");

-- CreateIndex
CREATE INDEX "LogNotificacionWhatsAppManual_usuarioId_pagoId_sentAt_idx" ON "LogNotificacionWhatsAppManual"("usuarioId", "pagoId", "sentAt");

-- CreateIndex
CREATE INDEX "Pago_estado_fechaVencimiento_idx" ON "Pago"("estado", "fechaVencimiento");

-- CreateIndex
CREATE INDEX "Pago_estado_usuarioId_fechaVencimiento_idx" ON "Pago"("estado", "usuarioId", "fechaVencimiento");

-- AddForeignKey
ALTER TABLE "ConfiguracionWhatsApp" ADD CONSTRAINT "ConfiguracionWhatsApp_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "Administrador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogNotificacionWhatsAppManual" ADD CONSTRAINT "LogNotificacionWhatsAppManual_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogNotificacionWhatsAppManual" ADD CONSTRAINT "LogNotificacionWhatsAppManual_pagoId_fkey" FOREIGN KEY ("pagoId") REFERENCES "Pago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogNotificacionWhatsAppManual" ADD CONSTRAINT "LogNotificacionWhatsAppManual_administradorId_fkey" FOREIGN KEY ("administradorId") REFERENCES "Administrador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
