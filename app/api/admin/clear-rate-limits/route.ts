import { NextRequest, NextResponse } from "next/server";
import { SecurityMiddleware } from "@/lib/security-middleware";
import { getCurrentUser } from "@/lib/auth-utils";

export async function POST(request: NextRequest) {
  try {
    // Only allow in development or for admin users
    if (process.env.NODE_ENV === "production") {
      const user = await getCurrentUser();
      if (!user || user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Clear the rate limit cache
    SecurityMiddleware.clearRateLimitCache();

    return NextResponse.json({
      success: true,
      message: "Rate limit cache cleared successfully",
    });
  } catch (error) {
    console.error("Error clearing rate limits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
