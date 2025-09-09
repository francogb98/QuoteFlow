-- AlterTable
ALTER TABLE "public"."Administrador" ADD COLUMN     "permitirModificarCobro" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "permitirModificarTarifa" BOOLEAN NOT NULL DEFAULT true;
