/*
  Warnings:

  - A unique constraint covering the columns `[emailVerificationToken]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."beneficiaries" ADD COLUMN     "operator" TEXT;

-- AlterTable
ALTER TABLE "public"."transfers" ADD COLUMN     "autoProcessed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mobileMoneyError" TEXT,
ADD COLUMN     "mobileMoneyTransactionId" TEXT;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "emailVerificationToken" TEXT,
ADD COLUMN     "emailVerificationTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "users_emailVerificationToken_key" ON "public"."users"("emailVerificationToken");
