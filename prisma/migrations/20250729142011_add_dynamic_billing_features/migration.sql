-- CreateEnum
CREATE TYPE "public"."TipoConfiguracionTarifa" AS ENUM ('FIJA_MENSUAL', 'DINAMICA_POR_FECHA_INGRESO');

-- AlterTable
ALTER TABLE "public"."ConfiguracionTarifa" ADD COLUMN     "diasGracia" INTEGER,
ADD COLUMN     "montoBase" DOUBLE PRECISION,
ADD COLUMN     "montoRecargo" DOUBLE PRECISION,
ADD COLUMN     "tipoConfiguracion" "public"."TipoConfiguracionTarifa" NOT NULL DEFAULT 'FIJA_MENSUAL';

-- AlterTable
ALTER TABLE "public"."Pago" ADD COLUMN     "fechaVencimiento" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."Usuario" ADD COLUMN     "fechaInicioMembresia" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Pago_fechaVencimiento_idx" ON "public"."Pago"("fechaVencimiento");
