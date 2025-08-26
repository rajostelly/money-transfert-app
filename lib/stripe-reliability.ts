import './server-only';
import { stripe } from './stripe-server';
import { prisma } from "./prisma";
import { AuditService } from "./audit-service";

/**
 * Stripe Reliability Monitoring Service
 * Tracks failure rates and ensures < 2% failure rate requirement
 */
export class StripeReliabilityService {
  private static readonly FAILURE_RATE_THRESHOLD = 0.02; // 2%
  private static readonly MONITORING_WINDOW_HOURS = 24;
  private static readonly ALERT_THRESHOLD = 0.015; // Alert at 1.5% to prevent exceeding 2%

  /**
   * Record a Stripe payment attempt
   */
  static async recordPaymentAttempt(
    type: "PAYMENT_INTENT" | "SUBSCRIPTION" | "INVOICE",
    success: boolean,
    stripeId: string,
    errorCode?: string,
    errorMessage?: string,
    amount?: number,
    currency?: string,
    userId?: string
  ) {
    try {
      await prisma.stripeReliabilityLog.create({
        data: {
          type,
          success,
          stripeId,
          errorCode,
          errorMessage,
          amount: amount ? amount.toString() : null,
          currency,
          userId,
          timestamp: new Date(),
        },
      });

      // Check if we're approaching failure threshold
      await this.checkFailureRate();

      // Log to audit service
      if (userId) {
        await AuditService.logPaymentEvent(
          userId,
          success ? "PAYMENT_SUCCESS" : "PAYMENT_FAILED",
          amount || 0,
          currency || "CAD",
          stripeId,
          undefined,
          undefined,
          { errorCode, errorMessage, type }
        );
      }
    } catch (error) {
      console.error("Failed to record payment attempt:", error);
    }
  }

  /**
   * Check current failure rate and alert if needed
   */
  static async checkFailureRate(): Promise<void> {
    const windowStart = new Date(
      Date.now() - this.MONITORING_WINDOW_HOURS * 60 * 60 * 1000
    );

    const logs = await prisma.stripeReliabilityLog.findMany({
      where: {
        timestamp: {
          gte: windowStart,
        },
      },
    });

    if (logs.length === 0) return;

    const failures = logs.filter((log) => !log.success).length;
    const total = logs.length;
    const failureRate = failures / total;

    console.log(
      `[STRIPE_MONITORING] Failure rate: ${(failureRate * 100).toFixed(
        2
      )}% (${failures}/${total})`
    );

    // Alert if approaching threshold
    if (failureRate >= this.ALERT_THRESHOLD) {
      await this.alertHighFailureRate(failureRate, failures, total);
    }

    // Store aggregated metrics
    await this.storeMetrics(failureRate, failures, total);
  }

  /**
   * Get failure rate statistics
   */
  static async getFailureRateStats(hours: number = 24) {
    const windowStart = new Date(Date.now() - hours * 60 * 60 * 1000);

    const logs = await prisma.stripeReliabilityLog.findMany({
      where: {
        timestamp: {
          gte: windowStart,
        },
      },
    });

    const total = logs.length;
    const failures = logs.filter((log) => !log.success).length;
    const successes = total - failures;
    const failureRate = total > 0 ? failures / total : 0;

    // Group by error codes
    const errorBreakdown = logs
      .filter((log) => !log.success && log.errorCode)
      .reduce((acc, log) => {
        const code = log.errorCode!;
        acc[code] = (acc[code] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    // Group by type
    const typeBreakdown = logs.reduce((acc, log) => {
      acc[log.type] = acc[log.type] || { total: 0, failures: 0 };
      acc[log.type].total++;
      if (!log.success) acc[log.type].failures++;
      return acc;
    }, {} as Record<string, { total: number; failures: number }>);

    return {
      window: { hours, start: windowStart },
      overall: {
        total,
        successes,
        failures,
        failureRate,
        isWithinThreshold: failureRate < this.FAILURE_RATE_THRESHOLD,
      },
      errorBreakdown,
      typeBreakdown,
      recentFailures: logs
        .filter((log) => !log.success)
        .slice(-10)
        .map((log) => ({
          timestamp: log.timestamp,
          type: log.type,
          errorCode: log.errorCode,
          errorMessage: log.errorMessage,
          stripeId: log.stripeId,
        })),
    };
  }

  /**
   * Alert on high failure rate
   */
  private static async alertHighFailureRate(
    failureRate: number,
    failures: number,
    total: number
  ): Promise<void> {
    const alertData = {
      failureRate: (failureRate * 100).toFixed(2) + "%",
      failures,
      total,
      threshold: (this.FAILURE_RATE_THRESHOLD * 100).toFixed(1) + "%",
      timestamp: new Date().toISOString(),
    };

    console.error("[STRIPE_RELIABILITY_ALERT]", alertData);

    // In production, this would:
    // 1. Send email/SMS alerts to administrators
    // 2. Create incident in monitoring system
    // 3. Possibly trigger automatic failover to backup payment processor
    // 4. Log to external monitoring service

    // For now, log to audit service
    await AuditService.logSystemChange(
      "system",
      "CONFIG_UPDATE",
      {},
      { alert: "HIGH_STRIPE_FAILURE_RATE", data: alertData }
    );
  }

  /**
   * Store aggregated metrics for reporting
   */
  private static async storeMetrics(
    failureRate: number,
    failures: number,
    total: number
  ): Promise<void> {
    try {
      await prisma.stripeMetrics.create({
        data: {
          failureRate,
          totalTransactions: total,
          failedTransactions: failures,
          windowStart: new Date(
            Date.now() - this.MONITORING_WINDOW_HOURS * 60 * 60 * 1000
          ),
          windowEnd: new Date(),
        },
      });
    } catch (error) {
      console.error("Failed to store Stripe metrics:", error);
    }
  }

  /**
   * Get historical failure rate trend
   */
  static async getFailureRateTrend(days: number = 7) {
    const metrics = await prisma.stripeMetrics.findMany({
      where: {
        windowStart: {
          gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { windowStart: "asc" },
    });

    return metrics.map((metric) => ({
      date: metric.windowStart.toISOString().split("T")[0],
      failureRate: Number(metric.failureRate),
      totalTransactions: metric.totalTransactions,
      failedTransactions: metric.failedTransactions,
      isWithinThreshold:
        Number(metric.failureRate) < this.FAILURE_RATE_THRESHOLD,
    }));
  }

  /**
   * Enhanced Stripe operation wrapper with reliability tracking
   */
  static async executeStripeOperation<T>(
    operation: () => Promise<T>,
    type: "PAYMENT_INTENT" | "SUBSCRIPTION" | "INVOICE",
    context: {
      userId?: string;
      amount?: number;
      currency?: string;
      description?: string;
    }
  ): Promise<T> {
    const startTime = Date.now();
    let stripeId = "unknown";
    let success = false;
    let errorCode: string | undefined;
    let errorMessage: string | undefined;

    try {
      const result = await operation();
      success = true;

      // Extract Stripe ID from result
      if (typeof result === "object" && result !== null) {
        stripeId = (result as any).id || "unknown";
      }

      return result;
    } catch (error: any) {
      success = false;
      errorCode = error.code || error.type || "unknown";
      errorMessage = error.message || "Unknown error";

      console.error(`[STRIPE_ERROR] ${type} failed:`, {
        errorCode,
        errorMessage,
        context,
        duration: Date.now() - startTime,
      });

      throw error;
    } finally {
      // Record the attempt
      await this.recordPaymentAttempt(
        type,
        success,
        stripeId,
        errorCode,
        errorMessage,
        context.amount,
        context.currency,
        context.userId
      );
    }
  }

  /**
   * Generate reliability report for compliance
   */
  static async generateReliabilityReport(startDate: Date, endDate: Date) {
    const logs = await prisma.stripeReliabilityLog.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { timestamp: "desc" },
    });

    const total = logs.length;
    const successes = logs.filter((log) => log.success).length;
    const failures = total - successes;
    const failureRate = total > 0 ? failures / total : 0;

    // Daily breakdown
    const dailyStats = logs.reduce((acc, log) => {
      const date = log.timestamp.toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = { total: 0, successes: 0, failures: 0 };
      }
      acc[date].total++;
      if (log.success) {
        acc[date].successes++;
      } else {
        acc[date].failures++;
      }
      return acc;
    }, {} as Record<string, { total: number; successes: number; failures: number }>);

    // Convert to array and add failure rates
    const dailyBreakdown = Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      ...stats,
      failureRate: stats.failures / stats.total,
      withinThreshold:
        stats.failures / stats.total < this.FAILURE_RATE_THRESHOLD,
    }));

    return {
      period: { startDate, endDate },
      summary: {
        total,
        successes,
        failures,
        failureRate,
        isCompliant: failureRate < this.FAILURE_RATE_THRESHOLD,
        threshold: this.FAILURE_RATE_THRESHOLD,
      },
      dailyBreakdown,
      complianceStatus:
        failureRate < this.FAILURE_RATE_THRESHOLD
          ? "COMPLIANT"
          : "NON_COMPLIANT",
    };
  }
}
