import { NextRequest, NextResponse } from "next/server";
import { SecurityMiddleware } from "./lib/security-middleware";

/**
 * Global Security Middleware for PCI DSS Compliance
 * This middleware applies security measures to all requests
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/public/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Determine endpoint type for appropriate rate limiting
  let endpointType: "api" | "auth" | "payment" | "admin" = "api";

  if (
    pathname.startsWith("/api/auth") ||
    pathname.includes("login") ||
    pathname.includes("register")
  ) {
    endpointType = "auth";
  } else if (
    pathname.startsWith("/api/payments") ||
    pathname.startsWith("/api/transfers") ||
    pathname.startsWith("/api/subscriptions")
  ) {
    endpointType = "payment";
  } else if (
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/admin")
  ) {
    endpointType = "admin";
  }

  // Apply security middleware
  const securityResponse = await SecurityMiddleware.createSecurityMiddleware(
    endpointType
  )(request);
  if (securityResponse) {
    return securityResponse;
  }

  // Create response and add security headers
  const response = NextResponse.next();
  return SecurityMiddleware.addSecurityHeaders(response);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
