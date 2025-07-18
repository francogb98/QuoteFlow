/*
  Warnings:

  - The values [MORA,EXTRA_MORA] on the enum `Estado` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Estado_new" AS ENUM ('PAGADO', 'PENDIENTE', 'INACTIVO');
ALTER TABLE "Usuario" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "Usuario" ALTER COLUMN "estado" TYPE "Estado_new" USING ("estado"::text::"Estado_new");
ALTER TYPE "Estado" RENAME TO "Estado_old";
ALTER TYPE "Estado_new" RENAME TO "Estado";
DROP TYPE "Estado_old";
ALTER TABLE "Usuario" ALTER COLUMN "estado" SET DEFAULT 'PENDIENTE';
COMMIT;
