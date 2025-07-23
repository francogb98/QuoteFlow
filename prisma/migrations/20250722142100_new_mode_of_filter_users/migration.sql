/*
  Warnings:

  - The values [PAGADO,PENDIENTE] on the enum `Estado` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `configuracionTarifaId` on the `Administrador` table. All the data in the column will be lost.
  - You are about to alter the column `monto` on the `Pago` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `mora` on the `Pago` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - Made the column `mora` on table `Pago` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Estado_new" AS ENUM ('ACTIVO', 'INACTIVO');
ALTER TABLE "Usuario" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "Usuario" ALTER COLUMN "estado" TYPE "Estado_new" USING ("estado"::text::"Estado_new");
ALTER TYPE "Estado" RENAME TO "Estado_old";
ALTER TYPE "Estado_new" RENAME TO "Estado";
DROP TYPE "Estado_old";
ALTER TABLE "Usuario" ALTER COLUMN "estado" SET DEFAULT 'ACTIVO';
COMMIT;

-- DropIndex
DROP INDEX "Administrador_configuracionTarifaId_key";

-- AlterTable
ALTER TABLE "Administrador" DROP COLUMN "configuracionTarifaId";

-- AlterTable
ALTER TABLE "Pago" ALTER COLUMN "monto" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "mora" SET NOT NULL,
ALTER COLUMN "mora" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Usuario" ALTER COLUMN "estado" SET DEFAULT 'ACTIVO';

-- CreateIndex
CREATE INDEX "Pago_usuarioId_idx" ON "Pago"("usuarioId");

-- CreateIndex
CREATE INDEX "Pago_fecha_idx" ON "Pago"("fecha");

-- CreateIndex
CREATE INDEX "Pago_periodo_idx" ON "Pago"("periodo");

-- CreateIndex
CREATE INDEX "Usuario_documento_idx" ON "Usuario"("documento");

-- CreateIndex
CREATE INDEX "Usuario_administradorId_idx" ON "Usuario"("administradorId");
