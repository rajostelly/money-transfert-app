-- Create initial database schema
-- This script will be executed to set up the database structure

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE "UserRole" AS ENUM ('CLIENT', 'ADMIN', 'MADAGASCAR_TEAM');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED');
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');
CREATE TYPE "TransferType" AS ENUM ('SUBSCRIPTION', 'ONE_TIME');
CREATE TYPE "NotificationType" AS ENUM ('TRANSFER_REMINDER', 'TRANSFER_COMPLETED', 'TRANSFER_FAILED', 'SUBSCRIPTION_CREATED', 'SUBSCRIPTION_CANCELLED', 'PAYMENT_FAILED');

-- Users table
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CLIENT',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Beneficiaries table
CREATE TABLE "beneficiaries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Madagascar',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beneficiaries_pkey" PRIMARY KEY ("id")
);

-- Subscriptions table
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "beneficiaryId" TEXT NOT NULL,
    "amountCAD" DECIMAL(10,2) NOT NULL,
    "frequency" TEXT NOT NULL,
    "nextTransferDate" TIMESTAMP(3) NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "stripeSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- Transfers table
CREATE TABLE "transfers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "beneficiaryId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "amountCAD" DECIMAL(10,2) NOT NULL,
    "amountMGA" DECIMAL(15,2) NOT NULL,
    "exchangeRate" DECIMAL(10,6) NOT NULL,
    "feeCAD" DECIMAL(10,2) NOT NULL,
    "totalCAD" DECIMAL(10,2) NOT NULL,
    "type" "TransferType" NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'PENDING',
    "stripePaymentIntentId" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "confirmedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transfers_pkey" PRIMARY KEY ("id")
);

-- Exchange rates table
CREATE TABLE "exchange_rates" (
    "id" TEXT NOT NULL,
    "fromCurrency" TEXT NOT NULL DEFAULT 'CAD',
    "toCurrency" TEXT NOT NULL DEFAULT 'MGA',
    "rate" DECIMAL(10,6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exchange_rates_pkey" PRIMARY KEY ("id")
);

-- Notifications table
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- System settings table
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId");
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");

-- Add foreign key constraints
ALTER TABLE "beneficiaries" ADD CONSTRAINT "beneficiaries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "beneficiaries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "transfers" ADD CONSTRAINT "transfers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "beneficiaries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
