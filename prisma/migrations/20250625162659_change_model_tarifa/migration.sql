/*
  Warnings:

  - You are about to drop the column `fechaFin` on the `ConfiguracionTarifa` table. All the data in the column will be lost.
  - You are about to drop the column `fechaInicio` on the `ConfiguracionTarifa` table. All the data in the column will be lost.
  - You are about to drop the column `monto` on the `ConfiguracionTarifa` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ConfiguracionTarifa" DROP COLUMN "fechaFin",
DROP COLUMN "fechaInicio",
DROP COLUMN "monto",
ADD COLUMN     "estaActiva" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "nombre" TEXT NOT NULL DEFAULT 'Configuración de tarifa';

-- CreateTable
CREATE TABLE "RangoTarifa" (
    "id" TEXT NOT NULL,
    "diaInicio" INTEGER NOT NULL,
    "diaFin" INTEGER NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "configuracionTarifaId" TEXT NOT NULL,

    CONSTRAINT "RangoTarifa_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RangoTarifa" ADD CONSTRAINT "RangoTarifa_configuracionTarifaId_fkey" FOREIGN KEY ("configuracionTarifaId") REFERENCES "ConfiguracionTarifa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
