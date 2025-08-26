import './server-only';
import { prisma } from './prisma';

export interface AuditLogEntry {
  id?: string;
  userId?: string | null;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
  createdAt?: Date;
}

/**
 * Comprehensive Audit Logging Service for Compliance
 * Meets PCI DSS Requirement 10 - Logging and Monitoring
 */
export class AuditService {
  /**
   * Log user authentication events
   */
  static async logAuthEvent(
    userId: string | null,
    action: "LOGIN" | "LOGOUT" | "LOGIN_FAILED" | "PASSWORD_RESET",
    ipAddress: string,
    userAgent: string,
    metadata?: any
  ) {
    return this.createAuditLog({
      userId,
      action,
      resource: "USER_AUTH",
      ipAddress,
      userAgent,
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    });
  }

  /**
   * Log transfer operations
   */
  static async logTransferEvent(
    userId: string,
    action: "CREATE" | "UPDATE" | "DELETE" | "COMPLETE" | "CANCEL",
    transferId: string,
    oldValues?: any,
    newValues?: any,
    ipAddress?: string,
    userAgent?: string
  ) {
    return this.createAuditLog({
      userId,
      action: `TRANSFER_${action}`,
      resource: "TRANSFER",
      resourceId: transferId,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
      metadata: {
        timestamp: new Date().toISOString(),
        sensitiveDataMasked: true,
      },
    });
  }

  /**
   * Log payment events
   */
  static async logPaymentEvent(
    userId: string,
    action:
      | "PAYMENT_INITIATED"
      | "PAYMENT_SUCCESS"
      | "PAYMENT_FAILED"
      | "REFUND",
    amount: number,
    currency: string,
    paymentId?: string,
    ipAddress?: string,
    userAgent?: string,
    metadata?: any
  ) {
    return this.createAuditLog({
      userId,
      action,
      resource: "PAYMENT",
      resourceId: paymentId,
      ipAddress,
      userAgent,
      metadata: {
        amount,
        currency,
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    });
  }

  /**
   * Log admin actions
   */
  static async logAdminAction(
    adminUserId: string,
    action: string,
    resource: string,
    resourceId?: string,
    oldValues?: any,
    newValues?: any,
    ipAddress?: string,
    userAgent?: string
  ) {
    return this.createAuditLog({
      userId: adminUserId,
      action: `ADMIN_${action}`,
      resource,
      resourceId,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
      metadata: {
        timestamp: new Date().toISOString(),
        adminAction: true,
      },
    });
  }

  /**
   * Log data access events
   */
  static async logDataAccess(
    userId: string,
    action: "READ" | "EXPORT" | "PRINT",
    resource: string,
    resourceId?: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    return this.createAuditLog({
      userId,
      action: `DATA_${action.toUpperCase()}`,
      resource,
      resourceId,
      ipAddress,
      userAgent,
      metadata: {
        timestamp: new Date().toISOString(),
        dataAccess: true,
      },
    });
  }

  /**
   * Log system configuration changes
   */
  static async logSystemChange(
    adminUserId: string,
    action: "CONFIG_UPDATE" | "RATE_UPDATE" | "SETTINGS_CHANGE",
    oldValues: any,
    newValues: any,
    ipAddress?: string,
    userAgent?: string
  ) {
    return this.createAuditLog({
      userId: adminUserId,
      action,
      resource: "SYSTEM_CONFIG",
      oldValues,
      newValues,
      ipAddress,
      userAgent,
      metadata: {
        timestamp: new Date().toISOString(),
        systemChange: true,
      },
    });
  }

  /**
   * Log subscription events
   */
  static async logSubscriptionEvent(
    userId: string,
    action: "CREATE" | "UPDATE" | "CANCEL" | "REACTIVATE",
    subscriptionId: string,
    oldValues?: any,
    newValues?: any,
    ipAddress?: string,
    userAgent?: string
  ) {
    return this.createAuditLog({
      userId,
      action: `SUBSCRIPTION_${action}`,
      resource: "SUBSCRIPTION",
      resourceId: subscriptionId,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Create audit log entry in database
   */
  private static async createAuditLog(entry: AuditLogEntry) {
    try {
      // Mask sensitive data before logging
      const maskedEntry = this.maskSensitiveDataInLog(entry);

      await prisma.auditLog.create({
        data: {
          userId: maskedEntry.userId,
          action: maskedEntry.action,
          resource: maskedEntry.resource,
          resourceId: maskedEntry.resourceId,
          oldValues: maskedEntry.oldValues
            ? JSON.stringify(maskedEntry.oldValues)
            : null,
          newValues: maskedEntry.newValues
            ? JSON.stringify(maskedEntry.newValues)
            : null,
          ipAddress: maskedEntry.ipAddress,
          userAgent: maskedEntry.userAgent,
          metadata: maskedEntry.metadata
            ? JSON.stringify(maskedEntry.metadata)
            : null,
        },
      });
    } catch (error: unknown) {
      console.error("Failed to create audit log:", error);
      // Don't throw error to avoid breaking main functionality
      // But log to system monitoring
      this.logToSystemMonitoring("AUDIT_LOG_FAILED", {
        error: error instanceof Error ? error.message : String(error),
        entry,
      });
    }
  }

  /**
   * Mask sensitive data in audit logs
   */
  private static maskSensitiveDataInLog(entry: AuditLogEntry): AuditLogEntry {
    const sensitiveFields = [
      "password",
      "token",
      "secret",
      "key",
      "ssn",
      "creditCard",
    ];

    const maskObject = (obj: any): any => {
      if (!obj || typeof obj !== "object") return obj;

      const masked = { ...obj };
      for (const [key, value] of Object.entries(masked)) {
        if (
          sensitiveFields.some((field) => key.toLowerCase().includes(field))
        ) {
          masked[key] =
            typeof value === "string"
              ? "*".repeat(value.length)
              : "***MASKED***";
        } else if (typeof value === "object") {
          masked[key] = maskObject(value);
        }
      }
      return masked;
    };

    return {
      ...entry,
      oldValues: entry.oldValues ? maskObject(entry.oldValues) : null,
      newValues: entry.newValues ? maskObject(entry.newValues) : null,
      metadata: entry.metadata ? maskObject(entry.metadata) : null,
    };
  }

  /**
   * Get audit logs for compliance reporting
   */
  static async getAuditLogs(
    startDate: Date,
    endDate: Date,
    userId?: string,
    action?: string,
    resource?: string
  ) {
    const where: any = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (userId) where.userId = userId;
    if (action) where.action = { contains: action };
    if (resource) where.resource = resource;

    return prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 10000, // Limit for performance
    });
  }

  /**
   * Export audit logs for compliance
   */
  static async exportAuditLogs(
    startDate: Date,
    endDate: Date,
    format: "CSV" | "JSON" = "CSV"
  ) {
    const logs = await this.getAuditLogs(startDate, endDate);

    if (format === "CSV") {
      const headers = [
        "timestamp",
        "userId",
        "action",
        "resource",
        "resourceId",
        "ipAddress",
        "userAgent",
      ];

      const csvContent = [
        headers.join(","),
        ...logs.map((log) =>
          [
            log.createdAt.toISOString(),
            log.userId || "",
            log.action,
            log.resource,
            log.resourceId || "",
            log.ipAddress || "",
            log.userAgent || "",
          ].join(",")
        ),
      ].join("\n");

      return csvContent;
    }

    return JSON.stringify(logs, null, 2);
  }

  /**
   * Log to external monitoring system (for high-level alerts)
   */
  private static logToSystemMonitoring(event: string, data: any) {
    // This would integrate with external monitoring services
    // like Sentry, DataDog, or custom logging service
    console.error(`[SYSTEM_MONITORING] ${event}:`, data);

    // In production, this would send to monitoring service
    // Example: Sentry.captureEvent({ message: event, extra: data });
  }

  /**
   * Generate compliance report
   */
  static async generateComplianceReport(startDate: Date, endDate: Date) {
    const logs = await this.getAuditLogs(startDate, endDate);

    const summary = {
      totalEvents: logs.length,
      authEvents: logs.filter((l) => l.resource === "USER_AUTH").length,
      transferEvents: logs.filter((l) => l.resource === "TRANSFER").length,
      paymentEvents: logs.filter((l) => l.resource === "PAYMENT").length,
      adminEvents: logs.filter((l) => l.action.startsWith("ADMIN_")).length,
      dataAccessEvents: logs.filter((l) => l.action.startsWith("DATA_")).length,
      systemChanges: logs.filter((l) => l.resource === "SYSTEM_CONFIG").length,
      uniqueUsers: new Set(logs.filter((l) => l.userId).map((l) => l.userId))
        .size,
      dateRange: { startDate, endDate },
    };

    return {
      summary,
      logs: logs.slice(0, 1000), // Limit for performance
    };
  }
}
