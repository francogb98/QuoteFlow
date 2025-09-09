/*
  Warnings:

  - You are about to drop the column `diasGracia` on the `ConfiguracionTarifa` table. All the data in the column will be lost.
  - You are about to drop the column `montoBase` on the `ConfiguracionTarifa` table. All the data in the column will be lost.
  - You are about to drop the column `montoRecargo` on the `ConfiguracionTarifa` table. All the data in the column will be lost.
  - You are about to drop the `ConfiguracionCobro` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ConfiguracionPagoUsuario` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlanTarifa` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `nombre` to the `RangoTarifa` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."ConfiguracionCobro" DROP CONSTRAINT "ConfiguracionCobro_administradorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ConfiguracionPagoUsuario" DROP CONSTRAINT "ConfiguracionPagoUsuario_planTarifaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ConfiguracionPagoUsuario" DROP CONSTRAINT "ConfiguracionPagoUsuario_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PlanTarifa" DROP CONSTRAINT "PlanTarifa_configuracionTarifaId_fkey";

-- AlterTable
ALTER TABLE "public"."ConfiguracionTarifa" DROP COLUMN "diasGracia",
DROP COLUMN "montoBase",
DROP COLUMN "montoRecargo";

-- AlterTable
ALTER TABLE "public"."RangoTarifa" ADD COLUMN     "nombre" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Usuario" ADD COLUMN     "dinamicaTarifaId" TEXT,
ADD COLUMN     "nombreTarifaAsignada" TEXT,
ADD COLUMN     "rangoTarifaId" TEXT;

-- DropTable
DROP TABLE "public"."ConfiguracionCobro";

-- DropTable
DROP TABLE "public"."ConfiguracionPagoUsuario";

-- DropTable
DROP TABLE "public"."PlanTarifa";

-- DropEnum
DROP TYPE "public"."MetodoCobro";

-- CreateTable
CREATE TABLE "public"."ConfiguracionDinamicaTarifa" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "montoBase" DOUBLE PRECISION NOT NULL,
    "diasGracia" INTEGER NOT NULL,
    "montoRecargo" DOUBLE PRECISION NOT NULL,
    "configuracionTarifaId" TEXT NOT NULL,

    CONSTRAINT "ConfiguracionDinamicaTarifa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConfiguracionDinamicaTarifa_configuracionTarifaId_idx" ON "public"."ConfiguracionDinamicaTarifa"("configuracionTarifaId");

-- CreateIndex
CREATE INDEX "Usuario_rangoTarifaId_idx" ON "public"."Usuario"("rangoTarifaId");

-- CreateIndex
CREATE INDEX "Usuario_dinamicaTarifaId_idx" ON "public"."Usuario"("dinamicaTarifaId");

-- AddForeignKey
ALTER TABLE "public"."Usuario" ADD CONSTRAINT "Usuario_rangoTarifaId_fkey" FOREIGN KEY ("rangoTarifaId") REFERENCES "public"."RangoTarifa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Usuario" ADD CONSTRAINT "Usuario_dinamicaTarifaId_fkey" FOREIGN KEY ("dinamicaTarifaId") REFERENCES "public"."ConfiguracionDinamicaTarifa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConfiguracionDinamicaTarifa" ADD CONSTRAINT "ConfiguracionDinamicaTarifa_configuracionTarifaId_fkey" FOREIGN KEY ("configuracionTarifaId") REFERENCES "public"."ConfiguracionTarifa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
