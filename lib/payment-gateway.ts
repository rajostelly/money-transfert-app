import "./server-only";
import { stripe } from "./stripe-server";
import { StripeReliabilityService } from "./stripe-reliability";
import { AuditService } from "./audit-service";

export interface PaymentMethod {
  id: string;
  name: string;
  type: "CARD" | "BANK" | "DIGITAL_WALLET" | "CRYPTO";
  enabled: boolean;
  config: any;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  userId: string;
  metadata?: any;
  paymentMethodType?: string;
  returnUrl?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  error?: string;
  metadata?: any;
}

/**
 * Scalable Payment Gateway Service
 * Supports multiple payment processors for enhanced reliability and scalability
 */
export class PaymentGatewayService {
  private static paymentMethods: Map<string, PaymentMethod> = new Map();
  private static primaryGateway = "stripe";
  private static fallbackGateways = ["paypal", "square"]; // Future implementations

  /**
   * Initialize payment gateways
   */
  static async initialize() {
    console.log("[PAYMENT_GATEWAY] Initializing payment methods...");

    // Register Stripe as primary payment method
    this.registerPaymentMethod({
      id: "stripe",
      name: "Stripe",
      type: "CARD",
      enabled: true,
      config: {
        apiVersion: "2024-12-18.acacia",
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        supportedCurrencies: ["CAD", "USD", "EUR"],
        features: ["subscriptions", "refunds", "disputes"],
      },
    });

    // Future payment methods can be registered here
    // this.registerPaymentMethod({ ... paypal config });
    // this.registerPaymentMethod({ ... square config });

    console.log("[PAYMENT_GATEWAY] Payment methods initialized");
  }

  /**
   * Register a payment method
   */
  static registerPaymentMethod(method: PaymentMethod) {
    this.paymentMethods.set(method.id, method);
    console.log(`[PAYMENT_GATEWAY] Registered payment method: ${method.name}`);
  }

  /**
   * Process payment with fallback support
   */
  static async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    const startTime = Date.now();

    // Try primary gateway first
    try {
      const result = await this.processPaymentWithGateway(
        this.primaryGateway,
        request
      );

      await AuditService.logPaymentEvent(
        request.userId,
        result.success ? "PAYMENT_SUCCESS" : "PAYMENT_FAILED",
        request.amount,
        request.currency,
        result.paymentId,
        undefined,
        undefined,
        {
          gateway: this.primaryGateway,
          duration: Date.now() - startTime,
          ...request.metadata,
        }
      );

      return result;
    } catch (error: any) {
      console.error(
        `[PAYMENT_GATEWAY] Primary gateway ${this.primaryGateway} failed:`,
        error
      );

      // Try fallback gateways
      for (const fallbackGateway of this.fallbackGateways) {
        if (
          this.paymentMethods.has(fallbackGateway) &&
          this.paymentMethods.get(fallbackGateway)?.enabled
        ) {
          try {
            console.log(
              `[PAYMENT_GATEWAY] Trying fallback gateway: ${fallbackGateway}`
            );

            const result = await this.processPaymentWithGateway(
              fallbackGateway,
              request
            );

            await AuditService.logPaymentEvent(
              request.userId,
              "PAYMENT_SUCCESS",
              request.amount,
              request.currency,
              result.paymentId,
              undefined,
              undefined,
              {
                gateway: fallbackGateway,
                fallbackUsed: true,
                primaryGatewayError: error.message,
                duration: Date.now() - startTime,
                ...request.metadata,
              }
            );

            return result;
          } catch (fallbackError: any) {
            console.error(
              `[PAYMENT_GATEWAY] Fallback gateway ${fallbackGateway} failed:`,
              fallbackError
            );
          }
        }
      }

      // All gateways failed
      await AuditService.logPaymentEvent(
        request.userId,
        "PAYMENT_FAILED",
        request.amount,
        request.currency,
        "failed",
        undefined,
        undefined,
        {
          allGatewaysFailed: true,
          primaryError: error.message,
          duration: Date.now() - startTime,
          ...request.metadata,
        }
      );

      throw new Error(
        "All payment gateways are currently unavailable. Please try again later."
      );
    }
  }

  /**
   * Process payment with specific gateway
   */
  private static async processPaymentWithGateway(
    gatewayId: string,
    request: PaymentRequest
  ): Promise<PaymentResult> {
    const gateway = this.paymentMethods.get(gatewayId);
    if (!gateway || !gateway.enabled) {
      throw new Error(`Payment gateway ${gatewayId} is not available`);
    }

    switch (gatewayId) {
      case "stripe":
        return this.processStripePayment(request);

      case "paypal":
        return this.processPayPalPayment(request);

      case "square":
        return this.processSquarePayment(request);

      default:
        throw new Error(`Unsupported payment gateway: ${gatewayId}`);
    }
  }

  /**
   * Process Stripe payment
   */
  private static async processStripePayment(
    request: PaymentRequest
  ): Promise<PaymentResult> {
    return StripeReliabilityService.executeStripeOperation(
      async () => {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(request.amount * 100), // Convert to cents
          currency: request.currency.toLowerCase(),
          metadata: {
            userId: request.userId,
            ...request.metadata,
          },
          automatic_payment_methods: { enabled: true },
        });

        return {
          success: true,
          paymentId: paymentIntent.id,
          status: "pending" as const,
          metadata: {
            clientSecret: paymentIntent.client_secret,
            stripePaymentIntentId: paymentIntent.id,
          },
        };
      },
      "PAYMENT_INTENT",
      {
        userId: request.userId,
        amount: request.amount,
        currency: request.currency,
        description: "Money transfer payment",
      }
    );
  }

  /**
   * Process PayPal payment (placeholder for future implementation)
   */
  private static async processPayPalPayment(
    request: PaymentRequest
  ): Promise<PaymentResult> {
    // This would integrate with PayPal SDK
    throw new Error("PayPal integration not yet implemented");
  }

  /**
   * Process Square payment (placeholder for future implementation)
   */
  private static async processSquarePayment(
    request: PaymentRequest
  ): Promise<PaymentResult> {
    // This would integrate with Square SDK
    throw new Error("Square integration not yet implemented");
  }

  /**
   * Create subscription across multiple gateways
   */
  static async createSubscription(request: {
    userId: string;
    amount: number;
    currency: string;
    frequency: "weekly" | "monthly" | "bi-weekly";
    paymentMethodId: string;
    metadata?: any;
  }): Promise<PaymentResult> {
    // Currently only Stripe supports subscriptions
    return StripeReliabilityService.executeStripeOperation(
      async () => {
        // Get or create Stripe customer
        const customer = await this.getOrCreateStripeCustomer(request.userId);

        // Create product and price
        const product = await stripe.products.create({
          name: `Money Transfer Subscription`,
          description: `Recurring transfer of ${request.amount} ${request.currency}`,
        });

        const intervalMapping = {
          weekly: "week",
          "bi-weekly": "week",
          monthly: "month",
        } as const;

        const intervalCount = request.frequency === "bi-weekly" ? 2 : 1;

        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: Math.round(request.amount * 100),
          currency: request.currency.toLowerCase(),
          recurring: {
            interval: intervalMapping[request.frequency],
            interval_count: intervalCount,
          },
        });

        // Create subscription
        const subscription = await stripe.subscriptions.create({
          customer: customer.id,
          items: [{ price: price.id }],
          default_payment_method: request.paymentMethodId,
          metadata: {
            userId: request.userId,
            ...request.metadata,
          },
        });

        return {
          success: true,
          paymentId: subscription.id,
          status: "completed" as const,
          metadata: {
            stripeSubscriptionId: subscription.id,
            customerId: customer.id,
          },
        };
      },
      "SUBSCRIPTION",
      {
        userId: request.userId,
        amount: request.amount,
        currency: request.currency,
        description: "Subscription creation",
      }
    );
  }

  /**
   * Get or create Stripe customer
   */
  private static async getOrCreateStripeCustomer(userId: string) {
    // This would typically involve database lookup
    // For now, create a new customer
    return stripe.customers.create({
      metadata: { userId },
    });
  }

  /**
   * Refund payment
   */
  static async refundPayment(
    paymentId: string,
    amount?: number,
    reason?: string,
    userId?: string
  ): Promise<PaymentResult> {
    // Determine which gateway was used based on payment ID format
    if (paymentId.startsWith("pi_")) {
      // Stripe payment intent
      return StripeReliabilityService.executeStripeOperation(
        async () => {
          const refund = await stripe.refunds.create({
            payment_intent: paymentId,
            amount: amount ? Math.round(amount * 100) : undefined,
            reason: reason as any,
          });

          return {
            success: true,
            paymentId: refund.id,
            status: "completed" as const,
            metadata: {
              originalPaymentId: paymentId,
              refundAmount: amount,
              reason,
            },
          };
        },
        "PAYMENT_INTENT",
        {
          userId,
          amount,
          currency: "CAD",
          description: "Payment refund",
        }
      );
    } else {
      throw new Error("Unsupported payment ID format for refund");
    }
  }

  /**
   * Get payment gateway health status
   */
  static async getGatewayHealthStatus() {
    const healthChecks = await Promise.allSettled([
      this.checkStripeHealth(),
      // Add other gateway health checks here
    ]);

    return {
      stripe:
        healthChecks[0].status === "fulfilled"
          ? healthChecks[0].value
          : { healthy: false, error: healthChecks[0].reason },
      // Add other gateways here
      overall: healthChecks.every(
        (check) => check.status === "fulfilled" && (check.value as any).healthy
      ),
    };
  }

  /**
   * Check Stripe health
   */
  private static async checkStripeHealth() {
    try {
      await stripe.paymentMethods.list({ limit: 1 });
      return { healthy: true, lastChecked: new Date().toISOString() };
    } catch (error: any) {
      return {
        healthy: false,
        error: error.message,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  /**
   * Get supported payment methods for user
   */
  static getSupportedPaymentMethods(countryCode?: string) {
    const methods = Array.from(this.paymentMethods.values())
      .filter((method) => method.enabled)
      .map((method) => ({
        id: method.id,
        name: method.name,
        type: method.type,
        supportedCurrencies: method.config.supportedCurrencies || ["CAD"],
        features: method.config.features || [],
      }));

    return methods;
  }

  /**
   * Update payment method configuration
   */
  static updatePaymentMethodConfig(
    methodId: string,
    config: Partial<PaymentMethod>
  ) {
    const method = this.paymentMethods.get(methodId);
    if (method) {
      this.paymentMethods.set(methodId, { ...method, ...config });
      console.log(`[PAYMENT_GATEWAY] Updated configuration for ${methodId}`);
    }
  }

  /**
   * Enable/disable payment method
   */
  static togglePaymentMethod(methodId: string, enabled: boolean) {
    const method = this.paymentMethods.get(methodId);
    if (method) {
      method.enabled = enabled;
      console.log(
        `[PAYMENT_GATEWAY] ${
          enabled ? "Enabled" : "Disabled"
        } payment method: ${methodId}`
      );
    }
  }

  /**
   * Get payment statistics
   */
  static async getPaymentStatistics(days: number = 30) {
    // This would aggregate data from all payment gateways
    const stripeStats = await StripeReliabilityService.getFailureRateStats(
      days * 24
    );

    return {
      totalTransactions: stripeStats.overall.total,
      successfulTransactions: stripeStats.overall.successes,
      failedTransactions: stripeStats.overall.failures,
      successRate: 1 - stripeStats.overall.failureRate,
      failureRate: stripeStats.overall.failureRate,
      isCompliant: stripeStats.overall.isWithinThreshold,
      byGateway: {
        stripe: stripeStats.overall,
      },
    };
  }
}
