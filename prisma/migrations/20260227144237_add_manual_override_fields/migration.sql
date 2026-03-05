-- AlterTable
ALTER TABLE "SuscripcionEmpresa" ADD COLUMN     "manualOverrideEstado" "EstadoSuscripcion",
ADD COLUMN     "manualOverrideHasta" TIMESTAMP(3);
