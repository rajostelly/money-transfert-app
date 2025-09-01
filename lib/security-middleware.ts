import { NextRequest, NextResponse } from "next/server";

// Rate limiting will use in-memory storage for now
// In production, integrate with Redis/Upstash for distributed rate limiting
let ratelimit: any = null;

/**
 * Rate Limiting and Security Middleware
 * Implements PCI DSS requirements for access control and monitoring
 */
export class SecurityMiddleware {
  /**
   * Apply rate limiting based on endpoint type
   */
  static async applyRateLimit(
    request: NextRequest,
    endpointType: "api" | "auth" | "payment" | "admin" = "api"
  ): Promise<NextResponse | null> {
    // Use in-memory rate limiting for now
    return this.fallbackRateLimit(request, endpointType);
  }

  /**
   * Fallback in-memory rate limiting for development
   */
  private static requestCounts = new Map<
    string,
    { count: number; resetTime: number }
  >();

  private static fallbackRateLimit(
    request: NextRequest,
    endpointType: string
  ): NextResponse | null {
    const ip = this.getClientIP(request);
    const identifier = `${endpointType}:${ip}`;
    const now = Date.now();
    const windowMs = 60 * 60 * 1000; // 1 hour
    const maxRequests = endpointType === "auth" ? 50 : 100; // Increased from 5 to 50

    const current = this.requestCounts.get(identifier);

    if (!current || now > current.resetTime) {
      this.requestCounts.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      });
      return null;
    }

    if (current.count >= maxRequests) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `Too many ${endpointType} requests. Try again later.`,
        },
        { status: 429 }
      );
    }

    current.count++;
    return null;
  }

  /**
   * Get client IP address
   */
  private static getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get("x-forwarded-for");
    const realIP = request.headers.get("x-real-ip");

    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }

    if (realIP) {
      return realIP;
    }

    return "unknown";
  }

  /**
   * Validate request headers for security
   */
  static validateSecurityHeaders(request: NextRequest): NextResponse | null {
    const userAgent = request.headers.get("user-agent");
    const contentType = request.headers.get("content-type");
    const { pathname } = request.nextUrl;

    // Block requests without user agent (likely bots)
    if (!userAgent || userAgent.length < 10) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Validate content type for POST/PUT requests
    if (["POST", "PUT", "PATCH"].includes(request.method)) {
      // Exempt certain endpoints that don't require JSON
      const exemptEndpoints = [
        "/api/init-db",
        "/api/auth/logout",
        "/api/webhooks/stripe",
      ];

      const isExempt = exemptEndpoints.some((endpoint) =>
        pathname.includes(endpoint)
      );

      if (
        !isExempt &&
        (!contentType || !contentType.includes("application/json"))
      ) {
        return NextResponse.json(
          { error: "Invalid content type" },
          { status: 400 }
        );
      }
    }

    return null;
  }

  /**
   * Add security headers to response
   */
  static addSecurityHeaders(response: NextResponse): NextResponse {
    // PCI DSS compliant security headers
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()"
    );

    // HSTS for HTTPS enforcement
    if (process.env.NODE_ENV === "production") {
      response.headers.set(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains; preload"
      );
    }

    // CSP for XSS protection
    response.headers.set(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https:",
        "connect-src 'self' https://api.stripe.com https://*.stripe.com",
        "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "upgrade-insecure-requests",
      ].join("; ")
    );

    return response;
  }

  /**
   * Validate API key for external integrations
   */
  static validateApiKey(request: NextRequest): boolean {
    const apiKey = request.headers.get("x-api-key");
    const validApiKeys = process.env.API_KEYS?.split(",") || [];

    return validApiKeys.includes(apiKey || "");
  }

  /**
   * Log security events
   */
  static logSecurityEvent(
    event: "RATE_LIMIT_HIT" | "INVALID_REQUEST" | "SUSPICIOUS_ACTIVITY",
    request: NextRequest,
    details?: any
  ) {
    const logData = {
      event,
      ip: this.getClientIP(request),
      userAgent: request.headers.get("user-agent"),
      url: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      details,
    };

    console.warn("[SECURITY_EVENT]", logData);

    // In production, this would integrate with security monitoring
    // Example: send to SIEM system, alert administrators for critical events
  }

  /**
   * Detect suspicious patterns
   */
  static detectSuspiciousActivity(request: NextRequest): boolean {
    const userAgent = request.headers.get("user-agent") || "";
    const ip = this.getClientIP(request);

    // Check for common bot patterns
    const suspiciousUserAgents = [
      "curl",
      "wget",
      "python-requests",
      "scrapy",
      "bot",
      "crawler",
    ];

    if (
      suspiciousUserAgents.some((pattern) =>
        userAgent.toLowerCase().includes(pattern)
      )
    ) {
      this.logSecurityEvent("SUSPICIOUS_ACTIVITY", request, {
        reason: "suspicious_user_agent",
      });
      return true;
    }

    // Check for known malicious IPs (this would be from a security service)
    const knownMaliciousIPs = process.env.BLOCKED_IPS?.split(",") || [];
    if (knownMaliciousIPs.includes(ip)) {
      this.logSecurityEvent("SUSPICIOUS_ACTIVITY", request, {
        reason: "blocked_ip",
      });
      return true;
    }

    return false;
  }

  /**
   * Create comprehensive security middleware function
   */
  static createSecurityMiddleware(
    endpointType: "api" | "auth" | "payment" | "admin" = "api"
  ) {
    return async (request: NextRequest): Promise<NextResponse | null> => {
      // 1. Detect suspicious activity
      if (this.detectSuspiciousActivity(request)) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }

      // 2. Validate security headers
      const headerValidation = this.validateSecurityHeaders(request);
      if (headerValidation) return headerValidation;

      // 3. Apply rate limiting
      const rateLimitResponse = await this.applyRateLimit(
        request,
        endpointType
      );
      if (rateLimitResponse) return rateLimitResponse;

      return null; // Continue to next middleware/handler
    };
  }
}
