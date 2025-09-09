-- DropForeignKey
ALTER TABLE "public"."ConfiguracionTarifa" DROP CONSTRAINT "ConfiguracionTarifa_administradorId_fkey";

-- AlterTable
ALTER TABLE "public"."Administrador" ADD COLUMN     "configuracionTarifaId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Administrador" ADD CONSTRAINT "Administrador_configuracionTarifaId_fkey" FOREIGN KEY ("configuracionTarifaId") REFERENCES "public"."ConfiguracionTarifa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
