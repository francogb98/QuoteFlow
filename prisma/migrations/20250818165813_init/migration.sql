-- CreateEnum
CREATE TYPE "public"."Estado" AS ENUM ('ACTIVO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "public"."EstadoPago" AS ENUM ('PAGADO', 'PENDIENTE', 'VENCIDO');

-- CreateEnum
CREATE TYPE "public"."MetodoPago" AS ENUM ('EFECTIVO', 'MERCADOPAGO', 'TRANSFERENCIA', 'TARJETA');

-- CreateEnum
CREATE TYPE "public"."Rol" AS ENUM ('ADMINISTRADOR', 'PROFESOR', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "public"."TipoPlanEmpresa" AS ENUM ('BASICO', 'PRO');

-- CreateEnum
CREATE TYPE "public"."EstadoEmpresa" AS ENUM ('ACTIVO', 'INACTIVO_POR_FALTA_DE_PAGO', 'SUSPENDIDO_MANUALMENTE');

-- CreateEnum
CREATE TYPE "public"."FrecuenciaPago" AS ENUM ('MENSUAL', 'ANUAL');

-- CreateEnum
CREATE TYPE "public"."TipoConfiguracionTarifa" AS ENUM ('FIJA_MENSUAL', 'DINAMICA_POR_FECHA_INGRESO');

-- CreateTable
CREATE TABLE "public"."Empresa" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,
    "planTipo" "public"."TipoPlanEmpresa" NOT NULL DEFAULT 'BASICO',
    "mercadoPagoPreApprovalId" TEXT,
    "estadoPago" "public"."EstadoEmpresa" NOT NULL DEFAULT 'ACTIVO',
    "frecuenciaPago" "public"."FrecuenciaPago" NOT NULL DEFAULT 'MENSUAL',
    "fechaUltimoPago" TIMESTAMP(3),
    "fechaProximoVencimiento" TIMESTAMP(3),
    "estaActiva" BOOLEAN NOT NULL DEFAULT true,
    "esCuentaPrueba" BOOLEAN NOT NULL DEFAULT false,
    "codigoPromocionalId" TEXT,
    "fechaFinPrueba" TIMESTAMP(3),

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Administrador" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "rol" "public"."Rol" NOT NULL DEFAULT 'PROFESOR',
    "estaActivo" BOOLEAN NOT NULL DEFAULT true,
    "empresaId" TEXT NOT NULL,
    "claveMercadoPago" TEXT,
    "tokenMercadoPagoExpiresAt" TIMESTAMP(3),
    "mercadoPagoRefreshToken" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Administrador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CodigoPromocional" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "duracionMeses" INTEGER NOT NULL DEFAULT 2,
    "estaActivo" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaExpiracion" TIMESTAMP(3),

    CONSTRAINT "CodigoPromocional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" TEXT NOT NULL,
    "action" VARCHAR(64) NOT NULL,
    "entityType" VARCHAR(32) NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" VARCHAR(1024),
    "ipAddress" VARCHAR(45),
    "userAgent" VARCHAR(512),
    "administradorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Usuario" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "telefono" TEXT,
    "edad" INTEGER,
    "estado" "public"."Estado" NOT NULL DEFAULT 'ACTIVO',
    "administradorId" TEXT NOT NULL,
    "estaActivo" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaInicioMembresia" TIMESTAMP(3),

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Pago" (
    "id" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mes" INTEGER NOT NULL,
    "año" INTEGER NOT NULL,
    "comprobante" TEXT,
    "usuarioId" TEXT NOT NULL,
    "estaVencido" BOOLEAN NOT NULL DEFAULT false,
    "estado" "public"."EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
    "metodo" "public"."MetodoPago" NOT NULL DEFAULT 'EFECTIVO',
    "periodo" TEXT NOT NULL,
    "fechaVencimiento" TIMESTAMP(3),

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ConfiguracionTarifa" (
    "id" TEXT NOT NULL,
    "tipoConfiguracion" "public"."TipoConfiguracionTarifa" NOT NULL DEFAULT 'FIJA_MENSUAL',
    "montoBase" DOUBLE PRECISION,
    "diasGracia" INTEGER,
    "montoRecargo" DOUBLE PRECISION,
    "administradorId" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estaActiva" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ConfiguracionTarifa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RangoTarifa" (
    "id" TEXT NOT NULL,
    "diaInicio" INTEGER NOT NULL,
    "diaFin" INTEGER NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "configuracionTarifaId" TEXT NOT NULL,

    CONSTRAINT "RangoTarifa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TempRegistration" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nombreEmpresa" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "planTipo" "public"."TipoPlanEmpresa" NOT NULL,
    "frecuenciaPago" "public"."FrecuenciaPago" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TempRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_nombre_key" ON "public"."Empresa"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Administrador_documento_key" ON "public"."Administrador"("documento");

-- CreateIndex
CREATE UNIQUE INDEX "Administrador_email_key" ON "public"."Administrador"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CodigoPromocional_codigo_key" ON "public"."CodigoPromocional"("codigo");

-- CreateIndex
CREATE INDEX "CodigoPromocional_codigo_idx" ON "public"."CodigoPromocional"("codigo");

-- CreateIndex
CREATE INDEX "CodigoPromocional_estaActivo_idx" ON "public"."CodigoPromocional"("estaActivo");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "public"."AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "public"."AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_administradorId_idx" ON "public"."AuditLog"("administradorId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "public"."AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "Usuario_documento_idx" ON "public"."Usuario"("documento");

-- CreateIndex
CREATE INDEX "Usuario_administradorId_idx" ON "public"."Usuario"("administradorId");

-- CreateIndex
CREATE INDEX "Pago_usuarioId_idx" ON "public"."Pago"("usuarioId");

-- CreateIndex
CREATE INDEX "Pago_fecha_idx" ON "public"."Pago"("fecha");

-- CreateIndex
CREATE INDEX "Pago_periodo_idx" ON "public"."Pago"("periodo");

-- CreateIndex
CREATE INDEX "Pago_fechaVencimiento_idx" ON "public"."Pago"("fechaVencimiento");

-- CreateIndex
CREATE UNIQUE INDEX "ConfiguracionTarifa_administradorId_key" ON "public"."ConfiguracionTarifa"("administradorId");

-- CreateIndex
CREATE INDEX "ConfiguracionTarifa_administradorId_idx" ON "public"."ConfiguracionTarifa"("administradorId");

-- CreateIndex
CREATE INDEX "RangoTarifa_configuracionTarifaId_idx" ON "public"."RangoTarifa"("configuracionTarifaId");

-- CreateIndex
CREATE UNIQUE INDEX "TempRegistration_documento_key" ON "public"."TempRegistration"("documento");

-- CreateIndex
CREATE UNIQUE INDEX "TempRegistration_email_key" ON "public"."TempRegistration"("email");

-- AddForeignKey
ALTER TABLE "public"."Empresa" ADD CONSTRAINT "Empresa_codigoPromocionalId_fkey" FOREIGN KEY ("codigoPromocionalId") REFERENCES "public"."CodigoPromocional"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Administrador" ADD CONSTRAINT "Administrador_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "public"."Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_administradorId_fkey" FOREIGN KEY ("administradorId") REFERENCES "public"."Administrador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Usuario" ADD CONSTRAINT "Usuario_administradorId_fkey" FOREIGN KEY ("administradorId") REFERENCES "public"."Administrador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pago" ADD CONSTRAINT "Pago_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConfiguracionTarifa" ADD CONSTRAINT "ConfiguracionTarifa_administradorId_fkey" FOREIGN KEY ("administradorId") REFERENCES "public"."Administrador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RangoTarifa" ADD CONSTRAINT "RangoTarifa_configuracionTarifaId_fkey" FOREIGN KEY ("configuracionTarifaId") REFERENCES "public"."ConfiguracionTarifa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
