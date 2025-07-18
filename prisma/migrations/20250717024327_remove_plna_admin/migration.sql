/*
  Warnings:

  - You are about to drop the column `plan` on the `Administrador` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Administrador" DROP COLUMN "plan";

-- DropEnum
DROP TYPE "TipoPlan";
