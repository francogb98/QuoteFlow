-- CreateEnum
CREATE TYPE "public"."MetodoCobro" AS ENUM ('MERCADOPAGO', 'COMPROBANTES', 'MIXTO');

-- CreateTable
CREATE TABLE "public"."PlanTarifa" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "monto" DOUBLE PRECISION NOT NULL,
    "diasSemana" INTEGER,
    "estaActivo" BOOLEAN NOT NULL DEFAULT true,
    "configuracionTarifaId" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanTarifa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ConfiguracionCobro" (
    "id" TEXT NOT NULL,
    "metodoPrincipal" "public"."MetodoCobro" NOT NULL DEFAULT 'COMPROBANTES',
    "mercadoPagoActivo" BOOLEAN NOT NULL DEFAULT false,
    "comprobantesActivo" BOOLEAN NOT NULL DEFAULT true,
    "administradorId" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfiguracionCobro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ConfiguracionPagoUsuario" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "planTarifaId" TEXT,
    "montoPersonalizado" DOUBLE PRECISION,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfiguracionPagoUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlanTarifa_configuracionTarifaId_idx" ON "public"."PlanTarifa"("configuracionTarifaId");

-- CreateIndex
CREATE INDEX "PlanTarifa_estaActivo_idx" ON "public"."PlanTarifa"("estaActivo");

-- CreateIndex
CREATE UNIQUE INDEX "ConfiguracionCobro_administradorId_key" ON "public"."ConfiguracionCobro"("administradorId");

-- CreateIndex
CREATE INDEX "ConfiguracionCobro_administradorId_idx" ON "public"."ConfiguracionCobro"("administradorId");

-- CreateIndex
CREATE UNIQUE INDEX "ConfiguracionPagoUsuario_usuarioId_key" ON "public"."ConfiguracionPagoUsuario"("usuarioId");

-- CreateIndex
CREATE INDEX "ConfiguracionPagoUsuario_usuarioId_idx" ON "public"."ConfiguracionPagoUsuario"("usuarioId");

-- CreateIndex
CREATE INDEX "ConfiguracionPagoUsuario_planTarifaId_idx" ON "public"."ConfiguracionPagoUsuario"("planTarifaId");

-- AddForeignKey
ALTER TABLE "public"."PlanTarifa" ADD CONSTRAINT "PlanTarifa_configuracionTarifaId_fkey" FOREIGN KEY ("configuracionTarifaId") REFERENCES "public"."ConfiguracionTarifa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConfiguracionCobro" ADD CONSTRAINT "ConfiguracionCobro_administradorId_fkey" FOREIGN KEY ("administradorId") REFERENCES "public"."Administrador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConfiguracionPagoUsuario" ADD CONSTRAINT "ConfiguracionPagoUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConfiguracionPagoUsuario" ADD CONSTRAINT "ConfiguracionPagoUsuario_planTarifaId_fkey" FOREIGN KEY ("planTarifaId") REFERENCES "public"."PlanTarifa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
