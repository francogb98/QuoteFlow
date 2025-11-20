-- AlterTable
ALTER TABLE "Administrador" ADD COLUMN     "resetPasswordExpires" TIMESTAMP(3),
ADD COLUMN     "resetPasswordTokenHash" TEXT;
