/*
  Warnings:

  - You are about to drop the column `razonSocial` on the `Administrador` table. All the data in the column will be lost.
  - Added the required column `empresa` to the `Administrador` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Administrador" DROP COLUMN "razonSocial",
ADD COLUMN     "empresa" TEXT NOT NULL;
