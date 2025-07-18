/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Administrador` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `TempRegistration` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Administrador` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `TempRegistration` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Administrador" ADD COLUMN     "email" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TempRegistration" ADD COLUMN     "email" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Administrador_email_key" ON "Administrador"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TempRegistration_email_key" ON "TempRegistration"("email");
