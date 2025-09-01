import { NextResponse } from "next/server";

export async function POST() {
  console.log("Logout API called");

  const response = NextResponse.json({
    success: true,
    message: "Successfully logged out",
  });

  // Clear the auth token cookie with multiple approaches
  const cookieOptions = [
    // Standard clear
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 0,
      path: "/",
    },
    // Past expiry clear
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      expires: new Date(0),
      path: "/",
    },
    // Domain-specific clear (if needed)
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 0,
      path: "/",
      domain: process.env.NODE_ENV === "production" ? undefined : "localhost",
    },
  ];

  // Apply all cookie clearing methods
  cookieOptions.forEach((options, index) => {
    response.cookies.set(
      `auth-token${index > 0 ? `-${index}` : ""}`,
      "",
      options
    );
  });

  // Also clear the main cookie one more time
  response.cookies.delete("auth-token");

  console.log("Logout API: cookies cleared");

  return response;
}
