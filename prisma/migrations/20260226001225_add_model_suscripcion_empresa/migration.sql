-- CreateEnum
CREATE TYPE "EstadoSuscripcion" AS ENUM ('TRIAL', 'ACTIVA', 'CANCELADA', 'VENCIDA', 'PENDIENTE');

-- CreateEnum
CREATE TYPE "EstadoPagoMercadoPago" AS ENUM ('PENDING', 'AUTHORIZED', 'PAID', 'CANCELLED', 'REJECTED');

-- CreateTable
CREATE TABLE "SuscripcionEmpresa" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "planTipo" "TipoPlanEmpresa" NOT NULL,
    "frecuenciaPago" "FrecuenciaPago" NOT NULL,
    "mercadoPagoPreApprovalId" TEXT,
    "estadoSuscripcion" "EstadoSuscripcion" NOT NULL DEFAULT 'TRIAL',
    "estadoPagoMercadoPago" "EstadoPagoMercadoPago",
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaFinPeriodoActual" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SuscripcionEmpresa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SuscripcionEmpresa_empresaId_key" ON "SuscripcionEmpresa"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "SuscripcionEmpresa_mercadoPagoPreApprovalId_key" ON "SuscripcionEmpresa"("mercadoPagoPreApprovalId");

-- AddForeignKey
ALTER TABLE "SuscripcionEmpresa" ADD CONSTRAINT "SuscripcionEmpresa_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
