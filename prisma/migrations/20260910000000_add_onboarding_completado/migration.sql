-- AlterTable
ALTER TABLE "Administrador" ADD COLUMN "onboardingCompletado" BOOLEAN NOT NULL DEFAULT false;

-- Marcar admins existentes como onboarding completado
UPDATE "Administrador" SET "onboardingCompletado" = true;
