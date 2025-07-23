/*
  Warnings:

  - You are about to alter the column `monto` on the `Pago` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to alter the column `mora` on the `Pago` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "Pago" ALTER COLUMN "monto" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "mora" DROP DEFAULT,
ALTER COLUMN "mora" SET DATA TYPE DOUBLE PRECISION;
