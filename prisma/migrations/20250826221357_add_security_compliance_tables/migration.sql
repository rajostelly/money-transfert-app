-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "oldValues" TEXT,
    "newValues" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."stripe_reliability_logs" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "stripeId" TEXT NOT NULL,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "amount" TEXT,
    "currency" TEXT,
    "userId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stripe_reliability_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."stripe_metrics" (
    "id" TEXT NOT NULL,
    "failureRate" DECIMAL(5,4) NOT NULL,
    "totalTransactions" INTEGER NOT NULL,
    "failedTransactions" INTEGER NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "windowEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stripe_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "public"."audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "public"."audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_resource_idx" ON "public"."audit_logs"("resource");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "public"."audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "stripe_reliability_logs_timestamp_idx" ON "public"."stripe_reliability_logs"("timestamp");

-- CreateIndex
CREATE INDEX "stripe_reliability_logs_success_idx" ON "public"."stripe_reliability_logs"("success");

-- CreateIndex
CREATE INDEX "stripe_reliability_logs_type_idx" ON "public"."stripe_reliability_logs"("type");

-- CreateIndex
CREATE INDEX "stripe_metrics_windowStart_idx" ON "public"."stripe_metrics"("windowStart");
