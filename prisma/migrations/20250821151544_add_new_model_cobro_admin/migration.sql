-- CreateEnum
CREATE TYPE "public"."ModeloDeCobro" AS ENUM ('COMPROBANTE', 'MERCADOPAGO');

-- AlterTable
ALTER TABLE "public"."Administrador" ADD COLUMN     "modeloDeCobro" "public"."ModeloDeCobro" NOT NULL DEFAULT 'COMPROBANTE';
