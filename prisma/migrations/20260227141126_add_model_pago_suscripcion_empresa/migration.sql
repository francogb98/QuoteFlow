-- CreateTable
CREATE TABLE "PagoSuscripcionEmpresa" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "suscripcionId" TEXT NOT NULL,
    "mercadoPagoPaymentId" TEXT NOT NULL,
    "mercadoPagoPreApprovalId" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "estadoMercadoPago" "EstadoPagoMercadoPago" NOT NULL,
    "fechaPago" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rawPayload" TEXT,

    CONSTRAINT "PagoSuscripcionEmpresa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PagoSuscripcionEmpresa_mercadoPagoPaymentId_key" ON "PagoSuscripcionEmpresa"("mercadoPagoPaymentId");

-- CreateIndex
CREATE INDEX "PagoSuscripcionEmpresa_empresaId_idx" ON "PagoSuscripcionEmpresa"("empresaId");

-- CreateIndex
CREATE INDEX "PagoSuscripcionEmpresa_suscripcionId_idx" ON "PagoSuscripcionEmpresa"("suscripcionId");

-- AddForeignKey
ALTER TABLE "PagoSuscripcionEmpresa" ADD CONSTRAINT "PagoSuscripcionEmpresa_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagoSuscripcionEmpresa" ADD CONSTRAINT "PagoSuscripcionEmpresa_suscripcionId_fkey" FOREIGN KEY ("suscripcionId") REFERENCES "SuscripcionEmpresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
