/*
  Warnings:

  - Added the required column `password` to the `Administrador` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Administrador" ADD COLUMN     "password" TEXT NOT NULL;
