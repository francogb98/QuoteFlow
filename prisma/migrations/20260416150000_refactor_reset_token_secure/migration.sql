-- Migration: refactor_reset_token_secure
-- 
-- Strategy:
-- 1. Clear all existing PasswordResetToken rows (they used plaintext token column).
--    These tokens are short-lived and cannot be migrated securely — users will
--    simply request a new reset link.
-- 2. Drop the old `token` column and add `tokenHash` column.
-- 3. Create the new PasswordResetSession table.

-- Step 1: Clear old tokens (plaintext — cannot migrate securely)
DELETE FROM "PasswordResetToken";

-- Step 2: Drop old plaintext token column and add tokenHash column
ALTER TABLE "PasswordResetToken" DROP COLUMN "token";
ALTER TABLE "PasswordResetToken" ADD COLUMN "tokenHash" TEXT NOT NULL;

-- Step 3: Add unique index on tokenHash
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- Step 4: Create PasswordResetSession table
CREATE TABLE "PasswordResetSession" (
    "id"          TEXT NOT NULL,
    "sessionHash" TEXT NOT NULL,
    "adminId"     TEXT NOT NULL,
    "expiresAt"   TIMESTAMP(3) NOT NULL,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetSession_pkey" PRIMARY KEY ("id")
);

-- Step 5: Unique index on sessionHash
CREATE UNIQUE INDEX "PasswordResetSession_sessionHash_key" ON "PasswordResetSession"("sessionHash");

-- Step 6: Performance indexes
CREATE INDEX "PasswordResetSession_adminId_idx" ON "PasswordResetSession"("adminId");
CREATE INDEX "PasswordResetSession_expiresAt_idx" ON "PasswordResetSession"("expiresAt");

-- Step 7: Foreign key from PasswordResetSession to Administrador (cascade delete)
ALTER TABLE "PasswordResetSession" ADD CONSTRAINT "PasswordResetSession_adminId_fkey"
    FOREIGN KEY ("adminId") REFERENCES "Administrador"("id") ON DELETE CASCADE ON UPDATE CASCADE;
