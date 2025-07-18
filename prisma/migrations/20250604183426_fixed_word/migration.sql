/*
  Warnings:

  - You are about to drop the column `name` on the `Word` table. All the data in the column will be lost.
  - You are about to drop the column `translate` on the `Word` table. All the data in the column will be lost.
  - Added the required column `translation` to the `Word` table without a default value. This is not possible if the table is not empty.
  - Added the required column `word` to the `Word` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Word" DROP COLUMN "name",
DROP COLUMN "translate",
ADD COLUMN     "translation" TEXT NOT NULL,
ADD COLUMN     "word" TEXT NOT NULL;
