-- AlterTable
ALTER TABLE "Empresa" ADD COLUMN     "codigoPromocionalId" TEXT,
ADD COLUMN     "esCuentaPrueba" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fechaFinPrueba" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "CodigoPromocional" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "duracionMeses" INTEGER NOT NULL DEFAULT 2,
    "estaActivo" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaExpiracion" TIMESTAMP(3),

    CONSTRAINT "CodigoPromocional_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CodigoPromocional_codigo_key" ON "CodigoPromocional"("codigo");

-- CreateIndex
CREATE INDEX "CodigoPromocional_codigo_idx" ON "CodigoPromocional"("codigo");

-- CreateIndex
CREATE INDEX "CodigoPromocional_estaActivo_idx" ON "CodigoPromocional"("estaActivo");

-- AddForeignKey
ALTER TABLE "Empresa" ADD CONSTRAINT "Empresa_codigoPromocionalId_fkey" FOREIGN KEY ("codigoPromocionalId") REFERENCES "CodigoPromocional"("id") ON DELETE SET NULL ON UPDATE CASCADE;
